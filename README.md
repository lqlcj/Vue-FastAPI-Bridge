# 接口测试面板

这是一个基于 Vue 3 + Vite + JavaScript 的简易接口测试面板，用于测试 FastAPI 后端接口。**新手友好版**，功能丰富但简单易用！

用于快速测试和学习 FastAPI 后端 API 接口，虽然网上有现成工具可以测试接口，但是这个小工具对于新手学习方面也有一些优势：

 1.全栈验证：	立即暴露 CORS 跨域问题、Cookie/Session 传输问题，直接在真实浏览器环境中测试。
 
 2.代码模板：	它就是你的 Axios 生产代码。可以直接复制粘贴到未来的正式项目里，只需替换变量，**所有功能，方法都有注释。***
 
 3.学习深化：	你是在用代码与后端对话，这比在 GUI 框里填数据，更能加深你对 HTTP 请求、JSON 序列化、Promise (async/await) 的理解。

## 功能特性<img width="1013" height="821" alt="屏幕截图 2025-12-04 133909" src="https://github.com/user-attachments/assets/6dbb3f5e-b407-418b-a9df-974a6bb25c1e" />


### 🔧 核心功能
- ✅ **通用接口测试器** - 支持 GET、POST、PUT、DELETE、PATCH 等所有 HTTP 方法
- ✅ **自定义请求头** - 可以添加 Authorization、Content-Type 等自定义请求头
- ✅ **JSON 请求体编辑器** - 支持格式化 JSON，方便编写请求体
- ✅ **动态 BaseURL 配置** - 可以随时切换后端服务器地址
- ✅ **请求历史记录** - 自动保存最近 10 条请求，点击即可快速重试
- ✅ **请求耗时显示** - 实时显示每次请求的响应时间
- ✅ **状态码显示** - 清晰显示 HTTP 状态码（200、404、500 等）
- ✅ **一键复制结果** - 快速复制响应数据到剪贴板

### ⚡ 快速测试
- ✅ 预设快速测试按钮，一键测试常用接口
- ✅ 支持自定义接口路径和参数

### 📊 结果展示
- ✅ 实时显示接口返回结果
- ✅ 格式化 JSON 显示，易于阅读
- ✅ 详细的错误信息提示
- ✅ 请求信息汇总（方法、URL、状态码、耗时）

### 📚 学习友好
- ✅ 详细的代码注释，帮助学习 Axios 和 Vue 3
- ✅ 注释涵盖 async/await、Promise、响应式 API 等核心概念

## 安装依赖

```bash
npm install
```

## 运行项目

```bash
npm run dev
```

项目会在 `http://localhost:5173` 启动（Vite 默认端口）。

## 构建生产版本

```bash
npm run build
```

## 项目结构

```
ApiDemo/
├── index.html          # HTML 入口文件
├── vite.config.js      # Vite 配置文件
├── package.json        # 项目依赖配置
├── src/
│   ├── main.js        # Vue 应用入口
│   ├── App.vue        # 主组件（接口测试面板）
│   └── api/
│       └── axios.js   # Axios 封装配置
└── README.md          # 项目说明
```

## 后端接口说明

确保你的 FastAPI 后端运行在 `http://127.0.0.1:8000`，并实现以下接口：

1. **GET /** - 根路径接口
2. **GET /items/{id}** - 获取指定 ID 的 item
3. **POST /users** - 创建用户（请求体：`{ "name": "用户名", "email": "邮箱" }`）

## 技术栈

- Vue 3 (Composition API + Script Setup)
- Vite 5
- Axios 1.6
- JavaScript (ES6+)

## 使用指南

### 基础使用

1. **配置后端地址**
   - 在"基础配置"区域输入你的后端服务器地址（默认：`http://127.0.0.1:8000`）
   - 点击"更新"按钮保存配置

2. **测试接口**
   - 在"通用接口测试器"中选择请求方法（GET、POST 等）
   - 输入接口路径（例如：`/users` 或 `/items/1`）
   - 如果是 POST/PUT/PATCH，在请求体编辑器中输入 JSON 数据
   - 点击"发送请求"按钮

3. **查看结果**
   - 在"接口返回结果"区域查看响应数据
   - 可以看到请求方法、URL、状态码、耗时等信息
   - 点击"复制结果"可以快速复制响应数据

### 高级功能

1. **自定义请求头**
   - 点击"自定义请求头"展开编辑器
   - 添加请求头（例如：`Authorization: Bearer token123`）
   - 点击"添加请求头"可以添加多个

2. **请求历史**
   - 所有请求会自动保存到历史记录
   - 点击历史记录中的任意一条可以快速重试
   - 最多保存 10 条记录

3. **快速测试**
   - 使用预设的快速测试按钮一键测试常用接口
   - 可以快速测试 `/`、`/docs`、`/openapi.json` 等

### 使用提示

1. 确保 FastAPI 后端服务正在运行
2. 如果接口需要认证，在"自定义请求头"中添加 `Authorization` 头
3. JSON 请求体可以使用"格式化 JSON"按钮自动格式化
4. 所有配置和历史记录会自动保存到浏览器本地存储
5. 阅读代码注释，学习 Axios 和 Vue 3 的用法

## 学习要点

代码中包含详细的中文注释，特别关注：

- Axios 的封装和配置（baseURL、拦截器）
- async/await 异步处理
- Vue 3 的响应式 API（ref）
- Promise 的错误处理（try/catch/finally）
- 本地存储（localStorage）的使用
- 浏览器剪贴板 API 的使用

