import { z } from 'zod';
import { RefObject, Dispatch, SetStateAction } from 'react';

// Core message types
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
  isStreaming?: boolean;
}

// Domain-specific context types
export type ResourceType = 'dataset' | 'api' | 'tutorial' | 'documentation' | 'tool';

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  description: string;
  tags: string[];
}

export enum TopicCategory {
  SATELLITE_DATA = 'satellite_data',
  REMOTE_SENSING = 'remote_sensing',
  IOT_SENSORS = 'iot_sensors',
  DATA_PROCESSING = 'data_processing',
  VISUALIZATION = 'visualization',
  MACHINE_LEARNING = 'machine_learning'
}

export interface Topic {
  id: string;
  category: TopicCategory;
  title: string;
  description: string;
  resources: Resource[];
}

// Component Props
export interface SidebarProps {
  selectedCategory: TopicCategory;
  onCategoryChange: (category: TopicCategory) => void;
  onClearChat: () => void;
  onExport: () => void;
}

export interface ChatAreaProps {
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  onInputChange: Dispatch<SetStateAction<string>>;
  onSendMessage: (message: string) => Promise<void>;
  endRef: RefObject<HTMLDivElement>;
}

export interface ContextPanelProps {
  topic: Topic | null;
  onClose: () => void;
  onTopicSelect: (topic: Topic) => void;
}

// Rate limiting types
export interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

// Request validation schemas
export const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message is too long'),
  context: z.object({
    topic: z.string().optional(),
    category: z.nativeEnum(TopicCategory).optional(),
    resources: z.array(z.string()).optional(),
  }).optional(),
});

export type MessageRequest = z.infer<typeof messageSchema>;

// Response validation schemas
export const responseSchema = z.object({
  content: z.string(),
  topic: z.string().optional(),
  resources: z.array(z.object({
    id: z.string(),
    title: z.string(),
    url: z.string().url(),
    type: z.enum(['dataset', 'api', 'tutorial', 'documentation', 'tool']),
    description: z.string(),
    tags: z.array(z.string()),
  })).optional(),
  error: z.string().optional(),
});

export type AssistantResponse = z.infer<typeof responseSchema>;

// Error types
export interface AIAssistantError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Analytics types
export interface MessageAnalytics {
  userId: string;
  messageId: string;
  timestamp: Date;
  category?: TopicCategory;
  responseTime: number;
  errorOccurred: boolean;
  tokensUsed?: number;
} 