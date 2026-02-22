# Chatbot Demo - 聊天机器人示例

这是一个展示如何使用 LLM Share Network 构建基础聊天机器人的示例项目。

## 功能说明

- 支持流式输出 (Streaming)
- 支持上下文对话
- 支持自定义系统提示词
- 支持多种模型配置

## 安装步骤

```bash
# 进入项目目录
cd chatbot-demo

# 安装依赖
npm install
```

## 运行说明

### 1. 配置环境变量

复制 `.env.example` 为 `.env` 并填入配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下内容：

```
LLM_API_KEY=your_api_key_here
LLM_BASE_URL=https://api.llmshare.network/v1
LLM_MODEL=gpt-3.5-turbo
```

### 2. 运行示例

```bash
# 开发模式
npm run dev

# 构建并运行
npm run build
npm start
```

### 3. 使用示例

```typescript
import { ChatBot } from './src/index';

const bot = new ChatBot({
  systemPrompt: '你是一个友好的AI助手。',
});

async function main() {
  const response = await bot.chat('你好，请介绍一下你自己');
  console.log('回复:', response);
  
  // 继续对话
  const followUp = await bot.chat('谢谢你！');
  console.log('追问:', followUp);
}

main();
```

## 代码说明

### 核心类

- `ChatBot`: 聊天机器人主类
  - `chat(message: string)`: 发送消息并获取回复
  - `chatStream(message: string)`: 流式对话
  - `clearHistory()`: 清除对话历史

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| systemPrompt | string | '' | 系统提示词 |
| model | string | 'gpt-3.5-turbo' | 使用的模型 |
| temperature | number | 0.7 | 温度参数 |
| maxTokens | number | 2048 | 最大token数 |
