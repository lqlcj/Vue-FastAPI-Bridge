<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <h1>接口测试面板</h1>
    <p class="subtitle">FastAPI 后端接口测试工具 - 新手友好版</p>

    <!-- 基础配置区域 -->
    <div class="config-section">
      <h2>⚙️ 基础配置</h2>
      <div class="config-row">
        <label>后端地址 (BaseURL):</label>
        <!-- v-model 双向绑定 baseURL，当用户修改时会自动更新 -->
        <input type="text" v-model="baseURL" placeholder="http://127.0.0.1:8000" class="input-field"
          @blur="updateBaseURL" />
        <button @click="updateBaseURL" class="btn-small">更新</button>
      </div>
    </div>

    <!-- 通用接口测试器 -->
    <div class="test-section universal-tester">
      <h2>🔧 通用接口测试器</h2>
      <p>可以测试任意接口，支持 GET、POST、PUT、DELETE、PATCH 等方法</p>

      <div class="request-row">
        <!-- 选择请求方法 -->
        <select v-model="requestMethod" class="method-select">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>

        <!-- 输入接口路径 -->
        <input type="text" v-model="requestUrl" placeholder="输入接口路径，例如: /users 或 /items/1"
          class="input-field url-input" />

        <!-- 发送请求按钮 -->
        <button @click="sendRequest" :disabled="isLoading" class="btn-primary">
          {{ isLoading ? '请求中...' : '发送请求' }}
        </button>
      </div>

      <!-- 请求头设置（可选） -->
      <div class="expandable-section">
        <button @click="showHeaders = !showHeaders" class="btn-toggle">
          {{ showHeaders ? '▼' : '▶' }} 自定义请求头（可选）
        </button>
        <div v-if="showHeaders" class="headers-editor">
          <div v-for="(header, index) in customHeaders" :key="index" class="header-row">
            <input type="text" v-model="header.key" placeholder="请求头名称，例如: Authorization"
              class="input-field header-key" />
            <input type="text" v-model="header.value" placeholder="请求头值，例如: Bearer token123"
              class="input-field header-value" />
            <button @click="removeHeader(index)" class="btn-danger btn-small">删除</button>
          </div>
          <button @click="addHeader" class="btn-secondary">+ 添加请求头</button>
        </div>
      </div>

      <!-- 请求体编辑器（POST/PUT/PATCH 时显示） -->
      <div v-if="['POST', 'PUT', 'PATCH'].includes(requestMethod)" class="body-editor">
        <label>请求体 (JSON 格式):</label>
        <!-- textarea 用于输入多行文本，这里用来输入 JSON -->
        <textarea v-model="requestBody" placeholder='例如: {"name": "张三", "age": 25}' class="textarea-field"
          rows="6"></textarea>
        <button @click="formatJSON" class="btn-secondary btn-small">格式化 JSON</button>
      </div>
    </div>

    <!-- 快速测试区域 -->
    <div class="test-section">
      <h2>⚡ 快速测试</h2>
      <p>预设的常用接口，点击即可快速测试</p>

      <div class="quick-buttons">
        <button @click="quickTest('GET', '/')" :disabled="isLoading" class="btn-quick">
          GET /
        </button>
        <button @click="quickTest('GET', '/docs')" :disabled="isLoading" class="btn-quick">
          GET /docs
        </button>
        <button @click="quickTest('GET', '/openapi.json')" :disabled="isLoading" class="btn-quick">
          GET /openapi.json
        </button>
      </div>
    </div>

    <!-- 请求历史 -->
    <div class="test-section" v-if="requestHistory.length > 0">
      <h2>📜 请求历史</h2>
      <p>最近 {{ requestHistory.length }} 条请求记录，点击可快速重试</p>
      <div class="history-list">
        <div v-for="(item, index) in requestHistory" :key="index" class="history-item" @click="retryRequest(item)">
          <span class="method-badge" :class="item.method.toLowerCase()">
            {{ item.method }}
          </span>
          <span class="history-url">{{ item.url }}</span>
          <span class="history-status" :class="item.success ? 'success' : 'error'">
            {{ item.statusCode || 'Error' }}
          </span>
          <span class="history-time">{{ item.time }}ms</span>
        </div>
      </div>
      <button @click="clearHistory" class="btn-secondary">清空历史</button>
    </div>

    <!-- 结果展示区域 -->
    <div class="result-section">
      <div class="result-header">
        <h2>📊 接口返回结果</h2>
        <!-- 复制按钮，只在有结果时显示 -->
        <button v-if="result.data || result.error" @click="copyResult" class="btn-copy">
          📋 复制结果
        </button>
      </div>

      <!-- 显示请求信息 -->
      <div v-if="currentRequest" class="request-info">
        <div class="info-item">
          <strong>请求方法:</strong>
          <span class="method-badge" :class="currentRequest.method.toLowerCase()">
            {{ currentRequest.method }}
          </span>
        </div>
        <div class="info-item">
          <strong>请求地址:</strong> {{ currentRequest.url }}
        </div>
        <div class="info-item" v-if="currentRequest.statusCode">
          <strong>状态码:</strong>
          <span :class="getStatusClass(currentRequest.statusCode)">
            {{ currentRequest.statusCode }}
          </span>
        </div>
        <div class="info-item" v-if="currentRequest.duration">
          <strong>请求耗时:</strong> {{ currentRequest.duration }}ms
        </div>
      </div>

      <!-- 显示加载状态 -->
      <div v-if="result.loading" class="loading">
        <div class="spinner"></div>
        请求中...
      </div>

      <!-- 显示成功返回的数据 -->
      <div v-else-if="result.data" class="result-success">
        <h3>✅ 请求成功</h3>
        <!-- JSON.stringify 将对象转换为格式化的 JSON 字符串，第三个参数 2 表示缩进 2 个空格 -->
        <pre>{{ formatResult(result.data) }}</pre>
      </div>

      <!-- 显示错误信息 -->
      <div v-else-if="result.error" class="result-error">
        <h3>❌ 请求失败</h3>
        <pre>{{ result.error }}</pre>
      </div>

      <!-- 初始状态提示 -->
      <div v-else class="result-placeholder">
        在上方输入接口信息，点击"发送请求"开始测试
      </div>
    </div>
  </div>
</template>

<script setup>
  // 导入 Vue 3 的响应式 API
  // ref 用于创建响应式的基本类型数据（字符串、数字、布尔值等）
  import { ref, onMounted } from 'vue'
  // 导入封装好的 axios 实例
  import apiClient from './api/axios.js'

  // ========== 响应式数据定义 ==========

  // 定义 baseURL，用于存储后端服务器地址
  const baseURL = ref('http://127.0.0.1:8000')

  // 定义请求方法，默认为 GET
  const requestMethod = ref('GET')

  // 定义请求 URL，用户输入的接口路径
  const requestUrl = ref('')

  // 定义请求体，用于 POST/PUT/PATCH 请求
  const requestBody = ref('')

  // 定义是否显示请求头编辑器
  const showHeaders = ref(false)

  // 定义自定义请求头数组，每个元素包含 key 和 value
  const customHeaders = ref([])

  // 定义是否正在加载请求
  const isLoading = ref(false)

  // 定义结果对象，用于存储接口返回的结果
  const result = ref({
    data: null,     // 成功时存储返回的数据
    error: null,    // 失败时存储错误信息
    loading: false  // 是否正在请求
  })

  // 定义当前请求信息，用于显示请求详情
  const currentRequest = ref(null)

  // 定义请求历史记录数组，最多保存 10 条
  const requestHistory = ref([])

  // ========== 生命周期钩子 ==========

  // onMounted 在组件挂载到 DOM 后执行
  onMounted(() => {
    // 从本地存储读取 baseURL（如果之前保存过）
    const savedBaseURL = localStorage.getItem('apiBaseURL')
    if (savedBaseURL) {
      baseURL.value = savedBaseURL
      updateBaseURL()
    }

    // 从本地存储读取请求历史
    const savedHistory = localStorage.getItem('requestHistory')
    if (savedHistory) {
      try {
        // JSON.parse 将字符串转换为 JavaScript 对象
        requestHistory.value = JSON.parse(savedHistory)
      } catch (e) {
        console.error('读取历史记录失败:', e)
      }
    }
  })

  // ========== 方法定义 ==========

  // 更新 baseURL 并保存到本地存储
  const updateBaseURL = () => {
    // 更新 axios 实例的 baseURL
    apiClient.defaults.baseURL = baseURL.value
    // localStorage.setItem 将数据保存到浏览器本地存储
    localStorage.setItem('apiBaseURL', baseURL.value)
    console.log('BaseURL 已更新为:', baseURL.value)
  }

  // 添加自定义请求头
  const addHeader = () => {
    // push 方法向数组末尾添加新元素
    customHeaders.value.push({ key: '', value: '' })
  }

  // 删除自定义请求头
  const removeHeader = (index) => {
    // splice 方法从数组中删除指定索引的元素
    // 第一个参数是起始索引，第二个参数是删除的数量
    customHeaders.value.splice(index, 1)
  }

  // 格式化 JSON 字符串
  const formatJSON = () => {
    try {
      // JSON.parse 将字符串解析为对象
      const parsed = JSON.parse(requestBody.value)
      // JSON.stringify 将对象转换为格式化的字符串
      // 第三个参数 2 表示缩进 2 个空格，让 JSON 更易读
      requestBody.value = JSON.stringify(parsed, null, 2)
    } catch (error) {
      // 如果 JSON 格式错误，提示用户
      alert('JSON 格式错误，请检查输入')
    }
  }

  // 格式化结果显示
  const formatResult = (data) => {
    // 如果 data 是对象或数组，格式化为 JSON 字符串
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2)
    }
    // 否则直接返回
    return data
  }

  // 获取状态码的 CSS 类名
  const getStatusClass = (statusCode) => {
    // 根据 HTTP 状态码返回不同的样式类
    if (statusCode >= 200 && statusCode < 300) return 'status-success'
    if (statusCode >= 400 && statusCode < 500) return 'status-error'
    if (statusCode >= 500) return 'status-server-error'
    return ''
  }

  // 发送通用请求
  const sendRequest = async () => {
    // 验证 URL 是否为空
    if (!requestUrl.value.trim()) {
      alert('请输入接口路径')
      return
    }

    // 记录请求开始时间，用于计算请求耗时
    const startTime = Date.now()

    // 设置加载状态
    isLoading.value = true
    result.value.loading = true
    result.value.data = null
    result.value.error = null
    currentRequest.value = null

    try {
      // 构建请求配置对象
      const config = {
        method: requestMethod.value.toLowerCase(),  // 转换为小写（axios 要求）
        url: requestUrl.value,  // 请求路径
      }

      // 如果有自定义请求头，添加到配置中
      if (customHeaders.value.length > 0) {
        config.headers = {}
        // forEach 遍历数组，对每个元素执行回调函数
        customHeaders.value.forEach(header => {
          // 只有当 key 和 value 都不为空时才添加
          if (header.key && header.value) {
            config.headers[header.key] = header.value
          }
        })
      }

      // 如果是 POST/PUT/PATCH 请求，添加请求体
      if (['POST', 'PUT', 'PATCH'].includes(requestMethod.value)) {
        if (requestBody.value.trim()) {
          try {
            // 尝试将字符串解析为 JSON 对象
            config.data = JSON.parse(requestBody.value)
          } catch (e) {
            // 如果解析失败，直接使用原始字符串
            config.data = requestBody.value
          }
        }
      }

      // 发送请求
      // apiClient.request(config) 是 axios 的通用请求方法
      // 可以根据 config 中的 method 自动选择对应的请求方法
      const response = await apiClient.request(config)

      // 计算请求耗时（毫秒）
      const duration = Date.now() - startTime

      // 获取响应状态码
      // 由于我们的拦截器返回了 { data, status, headers } 对象
      // 所以可以直接从 response.status 获取状态码
      const statusCode = response.status || 200

      // 请求成功，存储数据
      // response.data 是服务器返回的实际数据
      result.value.data = response.data
      result.value.error = null

      // 保存当前请求信息
      currentRequest.value = {
        method: requestMethod.value,
        url: requestUrl.value,
        statusCode: statusCode,
        duration: duration,
        success: true
      }

      // 保存到历史记录
      saveToHistory(currentRequest.value)

    } catch (error) {
      // 计算请求耗时
      const duration = Date.now() - startTime

      // 获取错误状态码
      let statusCode = null
      let errorMessage = '请求失败'

      if (error.response) {
        // 服务器返回了错误响应
        statusCode = error.response.status
        errorMessage = error.response.data
          ? JSON.stringify(error.response.data, null, 2)
          : `HTTP ${statusCode} 错误`
      } else if (error.request) {
        // 请求已发送但没有收到响应
        errorMessage = '无法连接到服务器，请检查后端服务是否启动'
      } else {
        // 请求配置出错
        errorMessage = error.message || '请求配置错误'
      }

      // 存储错误信息
      result.value.error = errorMessage
      result.value.data = null

      // 保存当前请求信息（失败）
      currentRequest.value = {
        method: requestMethod.value,
        url: requestUrl.value,
        statusCode: statusCode,
        duration: duration,
        success: false
      }

      // 保存到历史记录
      saveToHistory(currentRequest.value)

    } finally {
      // 恢复加载状态
      isLoading.value = false
      result.value.loading = false
    }
  }

  // 快速测试方法
  const quickTest = async (method, url) => {
    // 设置请求方法和 URL
    requestMethod.value = method
    requestUrl.value = url
    // 发送请求
    await sendRequest()
  }

  // 保存请求到历史记录
  const saveToHistory = (requestInfo) => {
    // 将新请求添加到数组开头
    requestHistory.value.unshift(requestInfo)

    // 只保留最近 10 条记录
    if (requestHistory.value.length > 10) {
      // slice 方法返回数组的一部分，这里取前 10 个元素
      requestHistory.value = requestHistory.value.slice(0, 10)
    }

    // 保存到本地存储
    localStorage.setItem('requestHistory', JSON.stringify(requestHistory.value))
  }

  // 重试历史请求
  const retryRequest = async (historyItem) => {
    // 根据历史记录填充表单
    requestMethod.value = historyItem.method
    requestUrl.value = historyItem.url
    // 发送请求
    await sendRequest()
  }

  // 清空历史记录
  const clearHistory = () => {
    // 确认对话框
    if (confirm('确定要清空所有历史记录吗？')) {
      requestHistory.value = []
      localStorage.removeItem('requestHistory')
    }
  }

  // 复制结果到剪贴板
  const copyResult = async () => {
    try {
      // 准备要复制的文本
      let textToCopy = ''
      if (result.value.data) {
        // 如果有成功数据，复制格式化的 JSON
        textToCopy = formatResult(result.value.data)
      } else if (result.value.error) {
        // 如果有错误，复制错误信息
        textToCopy = result.value.error
      }

      // navigator.clipboard.writeText 是浏览器 API，用于复制文本到剪贴板
      await navigator.clipboard.writeText(textToCopy)
      // 提示用户复制成功
      alert('已复制到剪贴板！')
    } catch (error) {
      // 如果复制失败（可能是浏览器不支持），使用传统方法
      console.error('复制失败:', error)
      alert('复制失败，请手动选择文本复制')
    }
  }
</script>

<style scoped>
  /* scoped 表示这些样式只作用于当前组件，不会影响其他组件 */

  .app-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  h1 {
    color: #2c3e50;
    text-align: center;
    margin-bottom: 10px;
  }

  .subtitle {
    text-align: center;
    color: #7f8c8d;
    margin-bottom: 30px;
  }

  /* 配置区域样式 */
  .config-section {
    background: #e7f3ff;
    border: 1px solid #b3d9ff;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
  }

  .config-section h2 {
    color: #0056b3;
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.1em;
  }

  .config-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .config-row label {
    font-weight: 500;
    color: #495057;
    min-width: 150px;
  }

  /* 测试区域样式 */
  .test-section {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .test-section h2 {
    color: #495057;
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.2em;
  }

  .test-section p {
    color: #6c757d;
    margin-bottom: 15px;
    font-size: 0.9em;
  }

  /* 请求行样式 */
  .request-row {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    align-items: center;
  }

  .method-select {
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    background: white;
    cursor: pointer;
    min-width: 100px;
  }

  .method-select:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  .url-input {
    flex: 1;
  }

  .input-field {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
  }

  .input-field:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  /* 按钮样式 */
  button {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  button:hover:not(:disabled) {
    background: #0056b3;
    transform: translateY(-1px);
  }

  button:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .btn-primary {
    background: #007bff;
    font-weight: 600;
  }

  .btn-secondary {
    background: #6c757d;
    font-size: 13px;
    padding: 8px 15px;
  }

  .btn-danger {
    background: #dc3545;
    font-size: 13px;
    padding: 8px 15px;
  }

  .btn-small {
    padding: 8px 15px;
    font-size: 13px;
  }

  .btn-toggle {
    background: transparent;
    color: #007bff;
    border: 1px solid #007bff;
    padding: 8px 15px;
    font-size: 13px;
  }

  .btn-toggle:hover {
    background: #007bff;
    color: white;
  }

  .btn-quick {
    background: #28a745;
    margin-right: 10px;
    margin-bottom: 10px;
  }

  .btn-quick:hover {
    background: #218838;
  }

  .btn-copy {
    background: #17a2b8;
    padding: 8px 15px;
    font-size: 13px;
  }

  .btn-copy:hover {
    background: #138496;
  }

  /* 可展开区域 */
  .expandable-section {
    margin-top: 15px;
  }

  .headers-editor {
    margin-top: 10px;
    padding: 15px;
    background: white;
    border-radius: 4px;
    border: 1px solid #dee2e6;
  }

  .header-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    align-items: center;
  }

  .header-key {
    flex: 1;
    margin-bottom: 0;
  }

  .header-value {
    flex: 2;
    margin-bottom: 0;
  }

  /* 请求体编辑器 */
  .body-editor {
    margin-top: 15px;
  }

  .body-editor label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #495057;
  }

  .textarea-field {
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    font-family: 'Courier New', monospace;
    box-sizing: border-box;
    resize: vertical;
  }

  .textarea-field:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  /* 快速测试按钮区域 */
  .quick-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  /* 请求历史 */
  .history-list {
    margin-bottom: 15px;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .history-item:hover {
    background: #f8f9fa;
    border-color: #007bff;
    transform: translateX(5px);
  }

  .history-url {
    flex: 1;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #495057;
  }

  .history-status {
    padding: 4px 8px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 600;
  }

  .history-status.success {
    background: #d4edda;
    color: #155724;
  }

  .history-status.error {
    background: #f8d7da;
    color: #721c24;
  }

  .history-time {
    font-size: 12px;
    color: #6c757d;
    min-width: 60px;
    text-align: right;
  }

  /* 方法标签 */
  .method-badge {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
    color: white;
    min-width: 60px;
    text-align: center;
  }

  .method-badge.get {
    background: #28a745;
  }

  .method-badge.post {
    background: #007bff;
  }

  .method-badge.put {
    background: #ffc107;
    color: #212529;
  }

  .method-badge.delete {
    background: #dc3545;
  }

  .method-badge.patch {
    background: #17a2b8;
  }

  /* 结果区域 */
  .result-section {
    background: #ffffff;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    margin-top: 30px;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .result-section h2 {
    color: #495057;
    margin: 0;
  }

  .result-section h3 {
    margin-top: 0;
    margin-bottom: 10px;
  }

  /* 请求信息 */
  .request-info {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 15px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
  }

  .info-item {
    font-size: 13px;
  }

  .info-item strong {
    color: #495057;
    margin-right: 5px;
  }

  .status-success {
    color: #28a745;
    font-weight: 600;
  }

  .status-error {
    color: #dc3545;
    font-weight: 600;
  }

  .status-server-error {
    color: #dc3545;
    font-weight: 600;
  }

  /* 加载状态 */
  .loading {
    color: #007bff;
    font-style: italic;
    padding: 20px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .result-success {
    background: #d4edda;
    border: 1px solid #c3e6cb;
    border-radius: 4px;
    padding: 15px;
  }

  .result-success h3 {
    color: #155724;
  }

  .result-error {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    padding: 15px;
  }

  .result-error h3 {
    color: #721c24;
  }

  .result-placeholder {
    color: #6c757d;
    font-style: italic;
    padding: 20px;
    text-align: center;
  }

  pre {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 15px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Courier New', monospace;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .app-container {
      padding: 10px;
    }

    .request-row {
      flex-direction: column;
    }

    .method-select {
      width: 100%;
    }

    .config-row {
      flex-direction: column;
      align-items: stretch;
    }

    .config-row label {
      min-width: auto;
      margin-bottom: 5px;
    }

    .request-info {
      grid-template-columns: 1fr;
    }
  }
</style>
