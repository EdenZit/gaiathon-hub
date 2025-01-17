'use client';

import { useState, useRef, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { ContextPanel } from './ContextPanel';
import { Message } from '@/types/ai-assistant';
import { toast } from 'react-hot-toast';

export function AIAssistantLayout() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContext, setShowContext] = useState(true);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, { content: message, isUser: true, timestamp: new Date() }]);
    
    try {
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context: activeTopic }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
        let currentMessage = '';
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No response stream available');

        // Add assistant message placeholder
        setMessages(prev => [...prev, {
          content: '',
          isUser: false,
          timestamp: new Date(),
          isStreaming: true,
        }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(5));

                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.done) {
                  if (data.topic) setActiveTopic(data.topic);
                  break;
                }

                currentMessage += data.content || '';
                // Update the last message with the current content
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && !lastMessage.isUser) {
                    lastMessage.content = currentMessage;
                  }
                  return newMessages;
                });
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      
      setMessages(prev => [...prev, {
        content: 'Sorry, there was an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
      setInputValue('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <ChatArea
        messages={messages}
        inputValue={inputValue}
        setInputValue={setInputValue}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
      />
      
      {showContext && (
        <ContextPanel
          activeTopic={activeTopic}
          onClose={() => setShowContext(false)}
        />
      )}
    </div>
  );
} 