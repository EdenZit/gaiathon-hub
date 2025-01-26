'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Socket } from 'socket.io-client';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import ChatHeader from '@/components/chat/ChatHeader';

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

export default function TeamChat() {
  const { data: session } = useSession();
  const params = useParams();
  const teamId = params.teamId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load initial messages
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/teams/${teamId}/messages`);
        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    if (session?.user) {
      loadMessages();
    }
  }, [session, teamId]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white">
      <ChatHeader teamId={teamId} />
      <div className="flex-1 overflow-y-auto p-4">
        <ChatMessageList messages={messages} currentUserId={session?.user?.id} />
      </div>
      <div className="border-t border-gray-200 p-4">
        <ChatInput
          onSendMessage={async (content) => {
            if (!session?.user) return;
            
            try {
              const response = await fetch(`/api/teams/${teamId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
              });
              
              if (!response.ok) throw new Error('Failed to send message');
              
              const newMessage = await response.json();
              setMessages(prev => [...prev, newMessage]);
            } catch (error) {
              console.error('Failed to send message:', error);
            }
          }}
        />
      </div>
    </div>
  );
} 