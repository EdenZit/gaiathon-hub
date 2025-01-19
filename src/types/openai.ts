import { z } from 'zod';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  isStreaming?: boolean;
  isError?: boolean;
  timestamp: Date;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface OpenAIChatRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
}

export interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message?: OpenAIMessage;
    delta?: Partial<OpenAIMessage>;
    finish_reason: string | null;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: TokenUsage;
  choices: {
    message: OpenAIMessage;
    finish_reason: string;
    index: number;
  }[];
}

export interface UserTokenUsage {
  userId: string;
  weekStartDate: Date;
  totalTokens: number;
  lastUpdated: Date;
}

export const tokenUsageSchema = z.object({
  userId: z.string(),
  weekStartDate: z.coerce.date(),
  totalTokens: z.number(),
  lastUpdated: z.coerce.date(),
});

export type TokenUsageRecord = z.infer<typeof tokenUsageSchema>; 