'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <div className="flex items-end space-x-2 bg-white rounded-lg border border-gray-200 p-2">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-500 hover:text-gray-600 focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-600 focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 resize-none border-0 focus:ring-0 max-h-32 p-2"
          rows={1}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim()}
          className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
} 