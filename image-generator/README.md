# Image Generator - AI 图像生成示例

这是一个展示如何使用 LLM Share Network 生成 AI 图像的示例项目。

## 功能说明

- 支持文本到图像生成 (Text-to-Image)
- 支持多种图像尺寸
- 支持图像风格选择
- 支持批量生成

## 安装步骤

```bash
# 进入项目目录
cd image-generator

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
import { ImageGenerator } from './src/index';

const generator = new ImageGenerator();

async function main() {
  // 生成单张图像
  const result = await generator.generate('一只可爱的橘猫坐在窗台上');
  console.log('图像URL:', result.url);
  
  // 指定图像尺寸和风格
  const result2 = await generator.generate('未来科技城市', {
    size: '1024x1024',
    style: 'vivid',
  });
  console.log('图像URL:', result2.url);
}

main();
```

## 代码说明

### 核心类

- `ImageGenerator`: 图像生成器类
  - `generate(prompt, options)`: 生成图像
  - `generateBatch(prompts, options)`: 批量生成图像

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| size | string | '1024x1024' | 图像尺寸 |
| style | string | 'natural' | 图像风格 |
| quality | string | 'standard' | 图像质量 |
