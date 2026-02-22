import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

interface CodeReviewResult {
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    line?: number;
    message: string;
    suggestion?: string;
  }>;
  score: number;
  summary: string;
}

export class CodeAssistant {
  private client: OpenAI;
  private model: string;

  constructor(options: {
    baseURL?: string;
    apiKey?: string;
    model?: string;
  } = {}) {
    this.client = new OpenAI({
      baseURL: options.baseURL || process.env.LLM_BASE_URL || 'https://api.llmshare.network/v1',
      apiKey: options.apiKey || process.env.LLM_API_KEY || '',
    });

    this.model = options.model || process.env.LLM_MODEL || 'gpt-4';

    if (!this.client.apiKey) {
      throw new Error('API Key 未配置。请在 .env 文件中设置 LLM_API_KEY');
    }
  }

  private async chat(messages: OpenAI.Chat.ChatMessage[]): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.3,
        max_tokens: 4096,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Code Assistant 请求失败: ${error.message}`);
      }
      throw error;
    }
  }

  async complete(code: string): Promise<string> {
    const messages: OpenAI.Chat.ChatMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的代码助手。请根据上下文补全代码，只返回补全的代码部分，不要包含解释。',
      },
      {
        role: 'user',
        content: `请补全以下代码:\n\`\`\`\n${code}\n\`\`\``,
      },
    ];

    return await this.chat(messages);
  }

  async explain(code: string): Promise<string> {
    const messages: OpenAI.Chat.ChatMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的代码助手。请详细解释代码的功能和逻辑。',
      },
      {
        role: 'user',
        content: `请解释以下代码:\n\`\`\`\n${code}\n\`\`\``,
      },
    ];

    return await this.chat(messages);
  }

  async review(code: string): Promise<CodeReviewResult> {
    const messages: OpenAI.Chat.ChatMessage[] = [
      {
        role: 'system',
        content: `你是一个专业的代码审查员。请审查代码并以JSON格式返回结果。
        格式要求:
        {
          "issues": [
            {
              "severity": "error|warning|info",
              "line": 数字(可选),
              "message": "问题描述",
              "suggestion": "修复建议(可选)"
            }
          ],
          "score": 1-10 数字,
          "summary": "总体评价"
        }`,
      },
      {
        role: 'user',
        content: `请审查以下代码:\n\`\`\`\n${code}\n\`\`\``,
      },
    ];

    const result = await this.chat(messages);

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('无法解析审查结果');
    } catch {
      return {
        issues: [],
        score: 5,
        summary: result,
      };
    }
  }

  async fixBug(code: string, errorDescription?: string): Promise<string> {
    const messages: OpenAI.Chat.ChatMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的代码助手。请根据错误描述修复代码中的 Bug。',
      },
      {
        role: 'user',
        content: errorDescription
          ? `请修复以下代码中的 Bug。错误描述: ${errorDescription}\n\`\`\`\n${code}\n\`\`\``
          : `请修复以下代码中的 Bug:\n\`\`\`\n${code}\n\`\`\``,
      },
    ];

    return await this.chat(messages);
  }

  async generateDoc(code: string, language: 'jsdoc' | 'tsdoc' | 'python' = 'jsdoc'): Promise<string> {
    const messages: OpenAI.Chat.ChatMessage[] = [
      {
        role: 'system',
        content: `你是一个专业的文档生成助手。请为代码生成 ${language} 格式的文档注释。`,
      },
      {
        role: 'user',
        content: `请为以下代码生成文档:\n\`\`\`\n${code}\n\`\`\``,
      },
    ];

    return await this.chat(messages);
  }
}

async function main() {
  try {
    const assistant = new CodeAssistant();

    console.log('=== 代码助手演示 ===\n');

    const code = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`;

    console.log('原始代码:');
    console.log(code);
    console.log('');

    const explanation = await assistant.explain(code);
    console.log('=== 代码解释 ===');
    console.log(explanation);

    console.log('\n=== 代码审查 ===');
    const review = await assistant.review(code);
    console.log('评分:', review.score, '/ 10');
    console.log('问题数:', review.issues.length);
    console.log('总结:', review.summary);
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

export default CodeAssistant;
