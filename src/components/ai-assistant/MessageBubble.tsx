'use client';

import { Message } from '@/types/ai-assistant';
import { AlertTriangle as AlertTriangleIcon } from 'lucide-react';
import { formatCodeBlocks } from '@/lib/services/ai-assistant';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const formattedContent = formatCodeBlocks(message.content);
  
  return (
    <div
      className={`flex ${
        message.isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`
          max-w-[80%] rounded-lg px-4 py-2
          ${message.isUser
            ? 'bg-navy-600 text-white'
            : message.isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-gray-100 text-gray-800'
          }
          ${message.isStreaming ? 'animate-pulse' : ''}
        `}
      >
        {message.isError ? (
          <div className="flex items-start space-x-2">
            <AlertTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p>{message.content}</p>
            </div>
          </div>
        ) : (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        )}
        
        <div className={`
          text-xs mt-1
          ${message.isUser
            ? 'text-navy-200'
            : message.isError
              ? 'text-red-600'
              : 'text-gray-500'
          }
        `}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
} 