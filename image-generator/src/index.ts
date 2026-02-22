import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

interface ImageOptions {
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
  quality?: 'standard' | 'hd';
  model?: string;
}

interface ImageResult {
  url: string;
  revisedPrompt?: string;
  model: string;
}

export class ImageGenerator {
  private client: OpenAI;
  private defaultSize: ImageOptions['size'];
  private defaultStyle: ImageOptions['style'];
  private defaultQuality: ImageOptions['quality'];
  private defaultModel: string;

  constructor(options: {
    baseURL?: string;
    apiKey?: string;
    size?: ImageOptions['size'];
    style?: ImageOptions['style'];
    quality?: ImageOptions['quality'];
    model?: string;
  } = {}) {
    this.client = new OpenAI({
      baseURL: options.baseURL || process.env.LLM_BASE_URL || 'https://api.llmshare.network/v1',
      apiKey: options.apiKey || process.env.LLM_API_KEY || '',
    });

    this.defaultSize = options.size || '1024x1024';
    this.defaultStyle = options.style || 'natural';
    this.defaultQuality = options.quality || 'standard';
    this.defaultModel = options.model || 'dall-e-3';

    if (!this.client.apiKey) {
      throw new Error('API Key 未配置。请在 .env 文件中设置 LLM_API_KEY');
    }
  }

  async generate(prompt: string, options: ImageOptions = {}): Promise<ImageResult> {
    try {
      const response = await this.client.images.generate({
        model: options.model || this.defaultModel,
        prompt,
        size: options.size || this.defaultSize,
        style: options.style || this.defaultStyle,
        quality: options.quality || this.defaultQuality,
        n: 1,
      });

      const image = response.data[0];
      if (!image) {
        throw new Error('图像生成失败，未返回有效数据');
      }

      return {
        url: image.url || '',
        revisedPrompt: image.revised_prompt,
        model: options.model || this.defaultModel,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error('图像生成失败:', error.message);
        throw new Error(`图像生成失败: ${error.message}`);
      }
      throw error;
    }
  }

  async *generateStream(prompt: string, options: ImageOptions = {}): AsyncGenerator<ImageResult> {
    const result = await this.generate(prompt, options);
    yield result;
  }

  async generateBatch(
    prompts: string[],
    options: ImageOptions = {}
  ): Promise<ImageResult[]> {
    try {
      const promises = prompts.map(prompt => this.generate(prompt, options));
      return await Promise.all(promises);
    } catch (error) {
      if (error instanceof Error) {
        console.error('批量图像生成失败:', error.message);
        throw new Error(`批量图像生成失败: ${error.message}`);
      }
      throw error;
    }
  }
}

async function main() {
  try {
    const generator = new ImageGenerator({
      size: '1024x1024',
      style: 'vivid',
    });

    console.log('=== 图像生成演示 ===\n');

    const result = await generator.generate('一只可爱的橘猫坐在窗台上，阳光照在它身上');
    console.log('生成的图像 URL:', result.url);
    console.log('修订后的提示词:', result.revisedPrompt);

    console.log('\n=== 批量生成演示 ===\n');

    const batchResults = await generator.generateBatch([
      '一只可爱的小狗',
      '一艘在星空下航行的船',
      '一座未来风格的建筑',
    ]);

    batchResults.forEach((r, i) => {
      console.log(`图像 ${i + 1}:`, r.url);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('错误:', error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export default ImageGenerator;
