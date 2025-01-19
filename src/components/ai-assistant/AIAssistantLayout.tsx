'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { nanoid } from 'nanoid';
import { toast } from 'react-hot-toast';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { ContextPanel } from './ContextPanel';
import { Message, Topic, TopicCategory } from '@/types/ai-assistant';
import { cleanResponse } from '@/lib/services/ai-assistant';

const SESSION_STORAGE_KEY = 'ai_assistant_messages';
const INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export function AIAssistantLayout() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContext, setShowContext] = useState(true);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TopicCategory>(TopicCategory.SATELLITE_DATA);
  const lastActivityRef = useRef<number>(Date.now());
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Load messages from session storage on mount
  useEffect(() => {
    const storedData = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedData) {
      try {
        const { messages: storedMessages, timestamp } = JSON.parse(storedData);
        
        // Check if stored messages are within the inactivity timeout
        if (Date.now() - timestamp < INACTIVITY_TIMEOUT) {
          setMessages(storedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })));
        } else {
          // Clear expired messages
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error loading stored messages:', error);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  }, []);

  // Save messages to session storage when updated
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        messages,
        timestamp: Date.now(),
      }));
    }
  }, [messages]);

  // Clear messages on logout
  useEffect(() => {
    if (!session) {
      setMessages([]);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [session]);

  // Handle inactivity cleanup
  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current >= INACTIVITY_TIMEOUT) {
        setMessages([]);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    };

    const interval = setInterval(checkInactivity, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    lastActivityRef.current = Date.now();
    setIsLoading(true);
    
    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          context: {
            topic: activeTopic?.title,
            category: selectedCategory,
            resources: activeTopic?.resources.map(r => r.id),
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
        // Add assistant message placeholder
        const assistantMessage: Message = {
          id: nanoid(),
          content: '',
          isUser: false,
          timestamp: new Date(),
          isStreaming: true,
        };
        
        setMessages(prev => [...prev, assistantMessage]);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No response stream available');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  throw new Error(data.error);
                }
                
                if (data.content) {
                  setMessages(prev => {
                    const updated = [...prev];
                    const lastMessage = updated[updated.length - 1];
                    if (lastMessage && !lastMessage.isUser) {
                      lastMessage.content = cleanResponse(lastMessage.content + data.content);
                      lastMessage.isStreaming = false;
                    }
                    return updated;
                  });
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
                throw e;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      
      setMessages(prev => [...prev, {
        id: nanoid(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: TopicCategory) => {
    setSelectedCategory(category);
    setActiveTopic(null);
  };

  const handleTopicSelect = (topic: Topic) => {
    setActiveTopic(topic);
    setSelectedCategory(topic.category);
  };

  const handleClearChat = () => {
    setMessages([]);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    toast.success('Chat history cleared');
  };

  const handleExport = () => {
    const exportData = {
      messages,
      topic: activeTopic,
      category: selectedCategory,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-assistant-chat-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Chat exported successfully');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onClearChat={handleClearChat}
        onExport={handleExport}
      />
      
      <main className="flex-1 flex">
        <ChatArea
          messages={messages}
          inputValue={inputValue}
          isLoading={isLoading}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          endRef={chatEndRef}
        />
        
        {showContext && (
          <ContextPanel
            topic={activeTopic}
            onClose={() => setShowContext(false)}
            onTopicSelect={handleTopicSelect}
          />
        )}
      </main>
    </div>
  );
} 