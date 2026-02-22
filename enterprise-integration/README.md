# Enterprise Integration - 企业集成示例

这是一个展示如何在企业环境中集成 LLM Share Network 的示例项目。

## 功能说明

- 支持企业认证集成
- 支持多租户管理
- 支持审计日志
- 支持 API 速率限制
- 支持 Webhook 回调

## 安装步骤

```bash
# 进入项目目录
cd enterprise-integration

# 安装依赖
npm install
```

## 运行说明

### 1. 配置环境变量

复制 `.env.example` 为 `.env` 并填入配置：

```bash
cp .env.example .env
```

### 2. 运行示例

```bash
npm run dev
```

### 3. 使用示例

```typescript
import { EnterpriseClient } from './src/index';

const client = new EnterpriseClient({
  tenantId: 'your-tenant-id',
  apiKey: process.env.LLM_API_KEY!,
});

async function main() {
  // 创建用户
  const user = await client.createUser({
    email: 'user@example.com',
    name: 'John Doe',
  });

  // 发送聊天请求
  const response = await client.chat('hello', {
    userId: user.id,
  });

  // 获取审计日志
  const logs = await client.getAuditLogs({
    startDate: new Date('2024-01-01'),
  });
}

main();
```

## 代码说明

### 核心类

- `EnterpriseClient`: 企业级客户端
  - `createUser(data)`: 创建用户
  - `chat(message, options)`: 聊天
  - `getAuditLogs(options)`: 获取审计日志
