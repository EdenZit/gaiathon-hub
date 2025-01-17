import { z } from 'zod';

export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message is too long. Maximum length is 2000 characters'),
  context: z.string().optional(),
});

export type ChatMessageRequest = z.infer<typeof chatMessageSchema>;

export const chatResponseSchema = z.object({
  response: z.string(),
  topic: z.string().optional(),
  error: z.string().optional(),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>; 