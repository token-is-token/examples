# Video Creator - 视频创作示例

这是一个展示如何使用 LLM Share Network 创建 AI 视频的示例项目。

## 功能说明

- 支持文本到视频生成 (Text-to-Video)
- 支持视频片段生成
- 支持视频编辑和合成
- 支持视频预览和导出

## 安装步骤

```bash
# 进入项目目录
cd video-creator

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
import { VideoCreator } from './src/index';

const creator = new VideoCreator();

async function main() {
  // 生成视频
  const result = await creator.create('一只猫在草地上奔跑');
  console.log('视频URL:', result.url);
  console.log('状态:', result.status);
}

main();
```

## 代码说明

### 核心类

- `VideoCreator`: 视频创作器类
  - `create(prompt, options)`: 创建视频
  - `getStatus(videoId)`: 获取视频状态
  - `download(videoId, outputPath)`: 下载视频
