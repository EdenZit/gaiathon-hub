'use client';

import { useRef, useEffect } from 'react';
import { SendIcon } from 'lucide-react';
import { ChatAreaProps } from '@/types/ai-assistant';
import { MessageBubble } from './MessageBubble';

export function ChatArea({
  messages,
  inputValue,
  setInputValue,
  isLoading,
  onSendMessage,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && inputValue.trim()) {
      onSendMessage(inputValue);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-navy-900">New Conversation</h2>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="mb-2">Welcome to GAIAthon AI Assistant!</p>
              <p className="text-sm">Ask me anything about Internet of Things or Earth observation.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about IoT or Earth observation..."
            className={`
              flex-1 p-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-navy-500
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className={`
              p-2 rounded-lg transition-colors
              ${isLoading || !inputValue.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-navy-600 hover:bg-navy-700 text-white'
              }
            `}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
        
        {isLoading && (
          <div className="mt-2 text-sm text-navy-600 animate-pulse">
            Processing your request...
          </div>
        )}
      </div>
    </div>
  );
} 