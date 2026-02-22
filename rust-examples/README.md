# Rust Examples - Rust 聊天机器人示例

这是一个展示如何使用 Rust 与 LLM Share Network 交互的示例项目。

## 功能说明

- 基础聊天功能
- 异步支持
- 类型安全的 API 设计

## 安装步骤

```bash
# 进入项目目录
cd rust-examples

# 构建项目
cargo build
```

## 运行说明

### 1. 配置环境变量

设置以下环境变量：

```bash
export LLM_API_KEY=your_api_key_here
export LLM_BASE_URL=https://api.llmshare.network/v1
export LLM_MODEL=gpt-3.5-turbo
```

### 2. 运行示例

```bash
# 运行基础聊天示例
cargo run --example basic_chat
```

## 示例说明

### basic_chat.rs

基础聊天示例，展示如何进行简单的对话。
