# AI Assistant - 流式聊天应用

一个基于前后端分离架构的AI聊天应用，支持流式响应、深度思考和视觉理解功能，集成了智谱清言API。

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS

### 后端
- Node.js
- Express
- Axios
- TypeScript

## 功能特性

- ✅ 流式聊天响应（打字机效果）
- ✅ 深度思考状态显示
- ✅ 视觉理解（支持图片上传和分析）
- ✅ 响应式设计，适配各种屏幕尺寸
- ✅ 消息点赞、重试和删除功能
- ✅ 实时错误提示
- ✅ 清空聊天记录

## 项目结构

```
├── frontend/            # 前端项目
│   ├── src/
│   │   ├── components/  # 聊天组件
│   │   ├── services/    # 前端服务层
│   │   ├── context/     # 状态管理
│   │   ├── types/       # 类型定义
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── backend/             # 后端项目
    ├── src/
    │   ├── routes/      # API路由
    │   ├── services/    # 后端服务层
    │   ├── types/       # 类型定义
    │   └── app.ts       # 应用入口
    ├── package.json
    └── tsconfig.json
```

## 快速开始

### 1. 配置环境变量

在后端目录创建 `.env` 文件，并配置智谱清言API密钥：

```bash
# backend/.env
ZHIPU_API_KEY=your_zhipu_api_key_here
PORT=3001
```

### 2. 安装依赖

#### 前端
```bash
cd frontend
npm install
```

#### 后端
```bash
cd backend
npm install
```

### 3. 启动应用

#### 后端
```bash
cd backend
npm run dev
```

后端服务将在 `http://localhost:3001` 启动。

#### 前端
```bash
cd frontend
npm run dev
```

前端应用将在 `http://localhost:3000` 启动。

### 4. 访问应用

打开浏览器，访问 `http://localhost:3000` 即可开始使用AI聊天应用。

## API 端点

### POST /api/chat/stream

流式聊天API，支持文本和图片输入。

#### 请求体
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello",
      "images": ["base64_encoded_image"],
      "timestamp": 1234567890
    }
  ],
  "temperature": 0.7,
  "top_p": 0.95,
  "max_tokens": 1024
}
```

#### 响应

返回 Server-Sent Events (SSE)，包含流式生成的聊天内容。

## 构建生产版本

### 前端
```bash
cd frontend
npm run build
```

构建产物将生成在 `frontend/dist` 目录。

### 后端
```bash
cd backend
npm run build
```

构建产物将生成在 `backend/dist` 目录。

## 运行生产版本

```bash
cd backend
npm start
```

## 开发说明

### 前端开发

- 使用 Vite 作为构建工具
- 使用 React Context API 进行状态管理
- 使用 Tailwind CSS 进行样式设计

### 后端开发

- 使用 Express 框架
- 使用 Axios 调用智谱清言API
- 支持 CORS 跨域请求

## 许可证

MIT
