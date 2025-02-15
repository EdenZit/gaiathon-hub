'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTeam } from '@/contexts/TeamContext';
import { toast } from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
  teamId: string;
  createdAt: string;
}

interface TeamChatProps {
  selectedTeam: string;
}

export default function TeamChat({ selectedTeam }: TeamChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentTeam } = useTeam();

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [selectedTeam]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/teams/${selectedTeam}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/teams/${selectedTeam}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender.id === session?.user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.sender.id === session?.user?.id
                  ? 'bg-navy-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {message.sender.id === session?.user?.id
                  ? 'You'
                  : `${message.sender.firstName} ${message.sender.lastName}`}
              </div>
              <p className="text-sm">{message.content}</p>
              <div className="text-xs mt-1 opacity-70">
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-navy-500"
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="inline-flex items-center rounded-md bg-navy-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-navy-500 focus:outline-none disabled:opacity-50"
          >
            {isSending ? <Spinner className="w-4 h-4" /> : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
} 