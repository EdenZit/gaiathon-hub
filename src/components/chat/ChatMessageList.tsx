'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
}

interface ChatMessageListProps {
  messages: Message[];
  currentUserId?: string;
}

export default function ChatMessageList({ messages, currentUserId }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="space-y-8">
      {Object.entries(messageGroups).map(([date, groupMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-center">
            <span className="px-4 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
              {format(new Date(date), 'MMMM d, yyyy')}
            </span>
          </div>
          {groupMessages.map((message, index) => {
            const isCurrentUser = message.sender.id === currentUserId;
            const showAvatar = index === 0 || 
              groupMessages[index - 1].sender.id !== message.sender.id;

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                  {!isCurrentUser && showAvatar && (
                    <div className="flex-shrink-0 w-8 h-8 relative">
                      <Image
                        src={message.sender.avatar || '/images/avatar-placeholder.png'}
                        alt={message.sender.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {showAvatar && (
                      <span className="text-xs text-gray-500 mb-1">
                        {message.sender.name}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2 rounded-lg max-w-md break-words ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {format(new Date(message.timestamp), 'HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
} 