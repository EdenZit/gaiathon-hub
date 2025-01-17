'use client';

import { Message } from '@/types/ai-assistant';
import { AlertTriangleIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={clsx(
        'flex',
        message.isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'max-w-3/4 p-3 rounded-lg',
          message.isUser
            ? 'bg-navy-600 text-white'
            : message.isError
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-white shadow'
        )}
      >
        {message.isError && (
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangleIcon className="w-4 h-4" />
            <span className="font-medium">Error</span>
          </div>
        )}
        <div className="prose prose-sm max-w-none">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-navy-600 animate-pulse" />
          )}
        </div>
        <div className="mt-1 text-xs opacity-70">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
} 