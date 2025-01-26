'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  ChatBubbleLeftEllipsisIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

interface Message {
  _id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  timestamp: Date;
  threadId?: string;
  attachments?: {
    type: string;
    url: string;
  }[];
  reactions: {
    emoji: string;
    users: string[];
  }[];
  replies?: Message[];
}

interface TeamChatProps {
  teamId: string;
}

export function TeamChat({ teamId }: TeamChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showThread, setShowThread] = useState(false);
  const [threadMessage, setThreadMessage] = useState('');
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [EmojiPicker, setEmojiPicker] = useState<any>(null);
  const [emojiData, setEmojiData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/team/chat/messages?teamId=${teamId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    // Fetch pinned messages
    const fetchPinnedMessages = async () => {
      try {
        const response = await fetch(`/api/team/chat/pinned?teamId=${teamId}`);
        if (response.ok) {
          const data = await response.json();
          setPinnedMessages(data);
        }
      } catch (error) {
        console.error('Error fetching pinned messages:', error);
      }
    };

    if (teamId) {
      fetchMessages();
      fetchPinnedMessages();

      // Initialize Socket.IO connection
      const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
        path: '/api/ws',
        autoConnect: true,
        withCredentials: true,
      });

      socket.on('connect', () => {
        console.log('Socket.IO connected');
        socket.emit('join-team', teamId);
      });

      socket.on('chat-message-received', (data) => {
        setMessages(prev => [data.message, ...prev]);
        scrollToBottom();
      });

      socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
      });

      setSocket(socket);

      return () => {
        socket.disconnect();
      };
    }
  }, [teamId]);

  useEffect(() => {
    // Load emoji picker dynamically
    const loadEmojiPicker = async () => {
      const [pickerModule, dataModule] = await Promise.all([
        import('@emoji-mart/react'),
        import('@emoji-mart/data')
      ]);
      setEmojiPicker(() => pickerModule.default);
      setEmojiData(dataModule.default);
    };
    loadEmojiPicker();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session?.user?.id) return;

    try {
      const message = {
        teamId,
        content: newMessage,
        userId: session.user.id,
        userName: session.user.name || '',
      };

      socket?.emit('chat-message', message);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendThreadMessage = async () => {
    if (!threadMessage.trim() || !session?.user?.id || !selectedMessage) return;

    try {
      const message = {
        teamId,
        content: threadMessage,
        userId: session.user.id,
        userName: session.user.name || '',
        threadId: selectedMessage._id,
      };

      socket?.emit('chat-message', message);
      setThreadMessage('');
    } catch (error) {
      console.error('Error sending thread message:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('teamId', teamId);

      const response = await fetch('/api/team/chat/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const message = {
          teamId,
          content: '',
          userId: session?.user?.id || '',
          userName: session?.user?.name || '',
          attachments: [{
            type: file.type,
            url: data.url,
          }],
        };

        socket?.emit('chat-message', message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/team/chat/messages/${messageId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(prev =>
          prev.map(msg =>
            msg._id === messageId ? updatedMessage : msg
          )
        );
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/team/chat/messages/${messageId}/pin`, {
        method: 'POST',
      });

      if (response.ok) {
        const pinnedMessage = await response.json();
        setPinnedMessages(prev => [...prev, pinnedMessage]);
      }
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.author.id === session?.user?.id
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-lg rounded-lg p-4 ${
                    message.author.id === session?.user?.id
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {message.author.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-800">{message.content}</p>

                  {/* Attachments */}
                  {message.attachments?.map((attachment, index) => (
                    <div key={index} className="mt-2">
                      {attachment.type.startsWith('image/') ? (
                        <img
                          src={attachment.url}
                          alt="Attachment"
                          className="max-w-sm rounded"
                        />
                      ) : (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Attachment
                        </a>
                      )}
                    </div>
                  ))}

                  {/* Reactions */}
                  <div className="flex items-center space-x-2 mt-2">
                    {message.reactions.map((reaction, index) => (
                      <button
                        key={index}
                        onClick={() => handleAddReaction(message._id, reaction.emoji)}
                        className="inline-flex items-center px-2 py-1 rounded-full bg-gray-200 text-sm"
                      >
                        {reaction.emoji} {reaction.users.length}
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setSelectedMessage(message);
                        setShowThread(true);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handlePinMessage(message._id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <MapPinIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowEmojiPicker(true)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaceSmileIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-gray-700"
            >
              <PaperClipIcon className="h-5 w-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => setShowEmojiPicker(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Thread Panel */}
      {showThread && selectedMessage && (
        <div className="w-96 bg-white rounded-lg shadow ml-4 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Thread</h3>
              <button
                onClick={() => {
                  setShowThread(false);
                  setSelectedMessage(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Original Message */}
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900">
                  {selectedMessage.author.name}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedMessage.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-800">{selectedMessage.content}</p>
            </div>

            {/* Thread Replies */}
            <div className="space-y-4">
              {selectedMessage.replies?.map((reply, index) => (
                <div
                  key={index}
                  className={`flex ${
                    reply.author.id === session?.user?.id
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-sm rounded-lg p-4 ${
                      reply.author.id === session?.user?.id
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {reply.author.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(reply.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-800">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thread Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={threadMessage}
                onChange={(e) => setThreadMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendThreadMessage()}
                placeholder="Reply to thread..."
                className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                onClick={handleSendThreadMessage}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && EmojiPicker && emojiData && (
        <div className="absolute bottom-20 right-20">
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <EmojiPicker
              data={emojiData}
              onEmojiSelect={(emoji: any) => {
                if (selectedMessage) {
                  handleAddReaction(selectedMessage._id, emoji.native);
                } else {
                  setNewMessage(prev => prev + emoji.native);
                }
                setShowEmojiPicker(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 