# Code Assistant - AI 代码助手示例

这是一个展示如何使用 LLM Share Network 构建 AI 代码助手的示例项目。

## 功能说明

- 支持代码补全
- 支持代码解释
- 支持代码审查
- 支持 Bug 修复建议
- 支持多语言支持

## 安装步骤

```bash
# 进入项目目录
cd code-assistant

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
LLM_MODEL=gpt-4
```

### 2. 运行示例

```bash
npm run dev
```

### 3. 使用示例

```typescript
import { CodeAssistant } from './src/index';

const assistant = new CodeAssistant();

async function main() {
  // 代码补全
  const completion = await assistant.complete(`
function fibonacci(n) {
    // 补全这个函数
  `);
  console.log('补全结果:', completion);

  // 代码解释
  const explanation = await assistant.explain(code);
  console.log('解释:', explanation);

  // 代码审查
  const review = await assistant.review(code);
  console.log('审查:', review);
}

main();
```

## 代码说明

### 核心类

- `CodeAssistant`: AI 代码助手类
  - `complete(code)`: 代码补全
  - `explain(code)`: 代码解释
  - `review(code)`: 代码审查
  - `fixBug(code)`: Bug 修复建议
