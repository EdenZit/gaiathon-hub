export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: OpenAIUsage;
  choices: Array<{
    text?: string;
    message?: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
}

export interface TokenUsage {
  userId: string;
  requestId: string;
  timestamp: Date;
  tokens: number;
  type: 'prompt' | 'completion';
  model: string;
}

export interface TokenUsageRecord {
  userId: string;
  weekStartDate: Date;
  totalTokens: number;
  lastUpdated: Date;
}

export const tokenUsageSchema = {
  parse: (data: any): TokenUsageRecord => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid token usage data');
    }

    const { userId, weekStartDate, totalTokens, lastUpdated } = data;

    if (!userId || !weekStartDate || typeof totalTokens !== 'number' || !lastUpdated) {
      throw new Error('Missing required fields in token usage data');
    }

    return {
      userId,
      weekStartDate: new Date(weekStartDate),
      totalTokens,
      lastUpdated: new Date(lastUpdated)
    };
  }
}; 