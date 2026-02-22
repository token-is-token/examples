# Python Examples - Python 聊天机器人示例

这是一个展示如何使用 Python 与 LLM Share Network 交互的示例项目。

## 功能说明

- 基础聊天功能
- 流式输出支持
- 异步请求支持

## 安装步骤

```bash
# 进入项目目录
cd python-examples

# 安装依赖
pip install -r requirements.txt
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
python examples/basic_chat.py

# 运行流式聊天示例
python examples/streaming_chat.py
```

## 示例说明

### basic_chat.py

基础聊天示例，展示如何进行简单的对话。

### streaming_chat.py

流式聊天示例，展示如何实时获取 AI 回复。
