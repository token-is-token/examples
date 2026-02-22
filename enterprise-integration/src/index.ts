import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

interface ChatOptions {
  userId?: string;
  temperature?: number;
  maxTokens?: number;
}

interface EnterpriseConfig {
  tenantId: string;
  apiKey: string;
  baseURL?: string;
  webhookUrl?: string;
  rateLimit?: number;
}

export class EnterpriseClient {
  private client: OpenAI;
  private config: EnterpriseConfig;
  private users: Map<string, User>;
  private auditLogs: AuditLog[];

  constructor(config: EnterpriseConfig) {
    this.config = config;
    this.client = new OpenAI({
      baseURL: config.baseURL || process.env.LLM_BASE_URL || 'https://api.llmshare.network/v1',
      apiKey: config.apiKey || process.env.LLM_API_KEY || '',
    });

    this.users = new Map();
    this.auditLogs = [];

    if (!this.client.apiKey) {
      throw new Error('API Key 未配置');
    }
  }

  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logAction(action: string, userId: string, details?: Record<string, unknown>): void {
    const log: AuditLog = {
      id: this.generateId(),
      userId,
      action,
      timestamp: new Date(),
      details,
    };
    this.auditLogs.push(log);
  }

  async createUser(data: { email: string; name: string }): Promise<User> {
    const user: User = {
      id: this.generateId(),
      email: data.email,
      name: data.name,
      createdAt: new Date(),
    };

    this.users.set(user.id, user);
    this.logAction('user.create', 'system', { userId: user.id, email: user.email });

    return user;
  }

  async getUser(userId: string): Promise<User | null> {
    this.logAction('user.get', userId);
    return this.users.get(userId) || null;
  }

  async listUsers(): Promise<User[]> {
    this.logAction('user.list', 'system');
    return Array.from(this.users.values());
  }

  async deleteUser(userId: string): Promise<boolean> {
    const deleted = this.users.delete(userId);
    if (deleted) {
      this.logAction('user.delete', 'system', { userId });
    }
    return deleted;
  }

  async chat(message: string, options: ChatOptions = {}): Promise<string> {
    const userId = options.userId || 'anonymous';
    this.logAction('chat.create', userId, { messageLength: message.length });

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
      });

      const content = response.choices[0]?.message?.content || '';
      this.logAction('chat.complete', userId, { responseLength: content.length });

      return content;
    } catch (error) {
      this.logAction('chat.error', userId, { error: String(error) });
      throw error;
    }
  }

  async getAuditLogs(options: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    action?: string;
  } = {}): Promise<AuditLog[]> {
    let logs = [...this.auditLogs];

    if (options.userId) {
      logs = logs.filter(log => log.userId === options.userId);
    }

    if (options.startDate) {
      logs = logs.filter(log => log.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      logs = logs.filter(log => log.timestamp <= options.endDate!);
    }

    if (options.action) {
      logs = logs.filter(log => log.action === options.action);
    }

    return logs;
  }

  getTenantId(): string {
    return this.config.tenantId;
  }

  getRateLimit(): number {
    return this.config.rateLimit || 100;
  }
}

async function main() {
  try {
    const client = new EnterpriseClient({
      tenantId: 'tenant-001',
      apiKey: process.env.LLM_API_KEY || '',
      rateLimit: 1000,
    });

    console.log('=== 企业集成演示 ===\n');

    console.log('租户 ID:', client.getTenantId());
    console.log('速率限制:', client.getRateLimit(), '请求/分钟\n');

    console.log('=== 用户管理演示 ===\n');

    const user1 = await client.createUser({
      email: 'john@example.com',
      name: 'John Doe',
    });
    console.log('创建用户:', user1);

    const user2 = await client.createUser({
      email: 'jane@example.com',
      name: 'Jane Smith',
    });
    console.log('创建用户:', user2);

    const users = await client.listUsers();
    console.log('用户列表:', users.length, '个用户');

    console.log('\n=== 审计日志演示 ===\n');

    const logs = await client.getAuditLogs();
    console.log('审计日志条数:', logs.length);
    logs.forEach(log => {
      console.log(`- [${log.action}] ${log.timestamp.toISOString()}`);
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

export default EnterpriseClient;
