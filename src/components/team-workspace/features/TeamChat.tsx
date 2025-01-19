'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  FaceSmileIcon,
  ChatBubbleLeftEllipsisIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

interface Message {
  _id: string;
  content: string;
  author: {
    email: string;
    name: string;
  };
  timestamp: string;
  threadId?: string;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  reactions?: Array<{
    emoji: string;
    users: string[];
  }>;
}

interface TeamChatProps {
  teamId: string;
  isTeamLeader: boolean;
}

export default function TeamChat({ teamId, isTeamLeader }: TeamChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      path: '/api/ws',
      autoConnect: true,
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Connected to chat WebSocket');
      socket.emit('join-team', { teamId });
    });

    socket.on('chat-message-received', (message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [teamId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/team/${teamId}/chat/messages`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
          setPinnedMessages(data.pinnedMessages || []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [teamId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket || !session?.user) return;

    try {
      socket.emit('chat-message', {
        teamId,
        content: newMessage,
        threadId: selectedThread,
        author: {
          email: session.user.email,
          name: session.user.name
        }
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/team/${teamId}/chat/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(messages.map(msg => 
          msg._id === messageId ? updatedMessage : msg
        ));
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/team/${teamId}/chat/attachments`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const attachment = await response.json();
        socket?.emit('chat-message', {
          teamId,
          content: `Shared a file: ${file.name}`,
          attachments: [attachment],
          threadId: selectedThread,
          author: {
            email: session?.user?.email,
            name: session?.user?.name
          }
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/team/${teamId}/chat/messages/${messageId}/pin`, {
        method: 'POST'
      });

      if (response.ok) {
        const { message, pinnedMessages: updated } = await response.json();
        setMessages(messages.map(msg => 
          msg._id === messageId ? message : msg
        ));
        setPinnedMessages(updated);
      }
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
      {/* Messages */}
      <div className="col-span-3 bg-white rounded-lg shadow flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages
            .filter(msg => !selectedThread || msg.threadId === selectedThread)
            .map((message) => (
              <div
                key={message._id}
                className={`mb-4 ${
                  message.author.email === session?.user?.email
                    ? 'flex flex-col items-end'
                    : 'flex flex-col items-start'
                }`}
              >
                <div className={`max-w-[70%] rounded-lg p-3 ${
                  message.author.email === session?.user?.email
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {message.author.name}
                    </span>
                    <span className="text-xs opacity-75">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p>{message.content}</p>
                  {message.attachments?.map((attachment, i) => (
                    <a
                      key={i}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 text-sm underline"
                    >
                      {attachment.name}
                    </a>
                  ))}
                  <div className="flex items-center gap-2 mt-2">
                    {message.reactions?.map((reaction, i) => (
                      <button
                        key={i}
                        onClick={() => handleReaction(message._id, reaction.emoji)}
                        className="text-sm bg-white/10 rounded px-2 py-1"
                      >
                        {reaction.emoji} {reaction.users.length}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => setSelectedThread(message._id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                  </button>
                  {isTeamLeader && (
                    <button
                      onClick={() => handlePinMessage(message._id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <MapPinIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <FaceSmileIcon className="h-6 w-6" />
            </button>
            <label className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer">
              <PaperClipIcon className="h-6 w-6" />
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700"
            >
              <PaperAirplaneIcon className="h-6 w-6" />
            </button>
          </div>
          {showEmojiPicker && (
            <div className="absolute bottom-20 right-4">
              <Picker
                data={data}
                onEmojiSelect={(emoji: any) => {
                  setNewMessage(prev => prev + emoji.native);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pinned Messages */}
      <div className="col-span-1 bg-white rounded-lg shadow p-4">
        <h3 className="font-medium text-gray-900 mb-4">Pinned Messages</h3>
        <div className="space-y-4">
          {pinnedMessages.map((message) => (
            <div key={message._id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{message.author.name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{message.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 