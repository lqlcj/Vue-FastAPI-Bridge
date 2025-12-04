// 导入 axios 库
import axios from "axios";

// 创建一个 axios 实例，用于统一配置请求
const apiClient = axios.create({
  // 设置基础 URL，所有请求都会自动拼接这个前缀
  // 这样在调用接口时，只需要写相对路径即可
  baseURL: "http://127.0.0.1:8000",
  // 设置请求超时时间（毫秒），超过这个时间请求会被取消
  timeout: 10000,
  // 设置请求头，告诉服务器我们发送的是 JSON 格式的数据
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器：在发送请求之前执行
apiClient.interceptors.request.use(
  // 成功时的处理函数
  (config) => {
    // 可以在这里添加 token 等认证信息
    // 例如：config.headers.Authorization = `Bearer ${token}`
    console.log("发送请求:", config.method.toUpperCase(), config.url);
    // 返回配置对象，axios 会使用这个配置发送请求
    return config;
  },
  // 失败时的处理函数（通常不会触发，除非配置有问题）
  (error) => {
    // 返回一个被拒绝的 Promise，这样请求就不会发送
    return Promise.reject(error);
  }
);

// 响应拦截器：在接收到响应之后执行
apiClient.interceptors.response.use(
  // 成功时的处理函数（状态码 2xx）
  (response) => {
    // response.data 是服务器返回的数据
    console.log("收到响应:", response.data);
    // 返回一个包含数据和状态码的对象，方便组件获取完整信息
    // 这样既可以使用 response.data 获取数据，也可以使用 response.status 获取状态码
    return {
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  },
  // 失败时的处理函数（状态码非 2xx 或网络错误）
  (error) => {
    // 处理错误信息
    if (error.response) {
      // 服务器返回了错误响应（状态码 4xx 或 5xx）
      console.error("响应错误:", error.response.status, error.response.data);
    } else if (error.request) {
      // 请求已发送但没有收到响应（可能是网络问题或服务器未启动）
      console.error("请求失败:", "无法连接到服务器");
    } else {
      // 请求配置出错
      console.error("请求配置错误:", error.message);
    }
    // 返回一个被拒绝的 Promise，这样组件中的 catch 可以捕获到错误
    return Promise.reject(error);
  }
);

// 导出配置好的 axios 实例，供其他组件使用
export default apiClient;
