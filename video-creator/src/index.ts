import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

interface VideoOptions {
  duration?: number;
  model?: string;
}

interface VideoResult {
  id: string;
  url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  model: string;
  prompt: string;
}

export class VideoCreator {
  private client: OpenAI;
  private defaultDuration: number;
  private defaultModel: string;
  private videos: Map<string, VideoResult>;

  constructor(options: {
    baseURL?: string;
    apiKey?: string;
    duration?: number;
    model?: string;
  } = {}) {
    this.client = new OpenAI({
      baseURL: options.baseURL || process.env.LLM_BASE_URL || 'https://api.llmshare.network/v1',
      apiKey: options.apiKey || process.env.LLM_API_KEY || '',
    });

    this.defaultDuration = options.duration || 5;
    this.defaultModel = options.model || 'sora-1';
    this.videos = new Map();

    if (!this.client.apiKey) {
      throw new Error('API Key 未配置。请在 .env 文件中设置 LLM_API_KEY');
    }
  }

  async create(prompt: string, options: VideoOptions = {}): Promise<VideoResult> {
    try {
      const response = await this.client.videos.generate({
        model: options.model || this.defaultModel,
        prompt,
        duration: options.duration || this.defaultDuration,
      });

      const video = response.data[0];
      if (!video) {
        throw new Error('视频生成失败，未返回有效数据');
      }

      const result: VideoResult = {
        id: video.id || '',
        url: video.url,
        status: (video.status as VideoResult['status']) || 'pending',
        model: options.model || this.defaultModel,
        prompt,
      };

      this.videos.set(result.id, result);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.error('视频创建失败:', error.message);
        throw new Error(`视频创建失败: ${error.message}`);
      }
      throw error;
    }
  }

  async getStatus(videoId: string): Promise<VideoResult> {
    try {
      const response = await this.client.videos.retrieve(videoId);
      
      const result: VideoResult = {
        id: response.id,
        url: response.url,
        status: (response.status as VideoResult['status']) || 'pending',
        model: response.model || this.defaultModel,
        prompt: response.prompt || '',
      };

      this.videos.set(result.id, result);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.error('获取视频状态失败:', error.message);
        throw new Error(`获取视频状态失败: ${error.message}`);
      }
      throw error;
    }
  }

  async download(videoId: string, outputPath: string): Promise<string> {
    try {
      const video = await this.getStatus(videoId);
      
      if (!video.url) {
        throw new Error('视频 URL 不可用，请等待视频生成完成');
      }

      const response = await fetch(video.url);
      if (!response.ok) {
        throw new Error(`下载视频失败: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const fullPath = path.resolve(outputPath);
      
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, Buffer.from(buffer));
      
      return fullPath;
    } catch (error) {
      if (error instanceof Error) {
        console.error('视频下载失败:', error.message);
        throw new Error(`视频下载失败: ${error.message}`);
      }
      throw error;
    }
  }

  getVideoHistory(): VideoResult[] {
    return Array.from(this.videos.values());
  }
}

async function main() {
  try {
    const creator = new VideoCreator({
      duration: 5,
    });

    console.log('=== 视频创作演示 ===\n');

    const result = await creator.create('一只猫在草地上奔跑，阳光明媚');
    console.log('创建的视频 ID:', result.id);
    console.log('状态:', result.status);

    console.log('\n等待视频生成...\n');
    console.log('提示: 实际使用时需要轮询获取视频生成状态');
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

export default VideoCreator;
