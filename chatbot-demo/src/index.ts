import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 聊天消息类型定义
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 聊天机器人配置选项
interface ChatBotOptions {
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string;
  apiKey?: string;
}

/**
 * ChatBot - 聊天机器人类
 * 
 * 提供基础的聊天功能，支持流式输出和上下文对话
 */
export class ChatBot {
  private client: OpenAI;
  private messages: ChatMessage[] = [];
  private model: string;
  private temperature: number;
  private maxTokens: number;

  /**
   * 创建聊天机器人实例
   * @param options 配置选项
   */
  constructor(options: ChatBotOptions = {}) {
    // 初始化 OpenAI 客户端
    this.client = new OpenAI({
      baseURL: options.baseURL || process.env.LLM_BASE_URL || 'https://api.llmshare.network/v1',
      apiKey: options.apiKey || process.env.LLM_API_KEY || '',
    });

    // 设置模型参数
    this.model = options.model || process.env.LLM_MODEL || 'gpt-3.5-turbo';
    this.temperature = options.temperature ?? 0.7;
    this.maxTokens = options.maxTokens ?? 2048;

    // 如果有系统提示词，添加到消息历史中
    if (options.systemPrompt) {
      this.messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    // 验证 API Key
    if (!this.client.apiKey) {
      throw new Error('API Key 未配置。请在 .env 文件中设置 LLM_API_KEY');
    }
  }

  /**
   * 发送聊天消息并获取回复
   * @param message 用户消息
   * @returns AI 回复内容
   */
  async chat(message: string): Promise<string> {
    try {
      // 添加用户消息到历史
      this.messages.push({
        role: 'user',
        content: message,
      });

      // 调用 API 获取回复
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: this.messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      });

      // 获取回复内容
      const assistantMessage = response.choices[0]?.message?.content || '';
      
      // 将助手回复添加到历史
      this.messages.push({
        role: 'assistant',
        content: assistantMessage,
      });

      return assistantMessage;
    } catch (error) {
      // 错误处理
      if (error instanceof Error) {
        console.error('聊天请求失败:', error.message);
        throw new Error(`聊天失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 流式对话 -逐步获取回复
   * @param message 用户消息
   * @param onChunk 每收到一个 chunk 时的回调函数
   */
  async *chatStream(
    message: string,
    onChunk?: (chunk: string) => void
  ): AsyncGenerator<string> {
    try {
      // 添加用户消息到历史
      this.messages.push({
        role: 'user',
        content: message,
      });

      // 创建流式请求
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: this.messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: true,
      });

      let fullResponse = '';

      // 逐块处理响应
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk?.(content);
          yield content;
        }
      }

      // 将完整回复添加到历史
      this.messages.push({
        role: 'assistant',
        content: fullResponse,
      });
    } catch (error) {
      // 错误处理
      if (error instanceof Error) {
        console.error('流式聊天请求失败:', error.message);
        throw new Error(`流式聊天失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 清除对话历史
   * 会保留系统提示词（如果有）
   */
  clearHistory(): void {
    const systemMessage = this.messages.find(m => m.role === 'system');
    this.messages = systemMessage ? [systemMessage] : [];
  }

  /**
   * 获取当前对话历史
   * @returns 消息历史数组
   */
  getHistory(): ChatMessage[] {
    return [...this.messages];
  }

  /**
   * 获取对话历史的消息数量
   * @returns 消息数量
   */
  getMessageCount(): number {
    return this.messages.length;
  }
}

// 主函数 - 演示用法
async function main() {
  try {
    // 创建聊天机器人实例
    const bot = new ChatBot({
      systemPrompt: '你是一个友好、专业的AI助手，擅长回答各种问题。',
      temperature: 0.7,
      maxTokens: 1024,
    });

    console.log('=== 聊天机器人演示 ===\n');

    // 发送第一条消息
    console.log('用户: 你好，请介绍一下你自己');
    const response1 = await bot.chat('你好，请介绍一下你自己');
    console.log('AI:', response1);
    console.log('');

    // 发送追问
    console.log('用户: 谢谢你！');
    const response2 = await bot.chat('谢谢你！');
    console.log('AI:', response2);
    console.log('');

    // 显示对话历史
    console.log('=== 对话历史 ===');
    console.log(`共 ${bot.getMessageCount()} 条消息`);

  } catch (error) {
    if (error instanceof Error) {
      console.error('错误:', error.message);
    }
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

export default ChatBot;
