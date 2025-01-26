'use client';

import { ChatAreaProps } from '@/types/ai-assistant';
import { MessageBubble } from './MessageBubble';
import { SendIcon } from 'lucide-react';

export function ChatArea({
  messages,
  inputValue,
  isLoading,
  onInputChange,
  onSendMessage,
  endRef,
}: ChatAreaProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-center">
              Welcome to the AI Assistant! Ask me anything about Earth Observation and IoT.
              <br />
              I'm here to help you with satellite data, remote sensing, IoT sensors, and more.
            </p>
          </div>
        ) : (
          messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
            />
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              rows={1}
              style={{
                minHeight: '2.5rem',
                maxHeight: '10rem',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-navy-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-navy-700 transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
} 