'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { Document } from '@/models/Document';
import {
  DocumentPlusIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

interface DocumentData {
  _id: string;
  title: string;
  content: string;
  format: string;
  version: number;
  lastModified: Date;
  sharedWith: {
    user: {
      _id: string;
      name: string;
    };
    role: string;
  }[];
}

interface CursorPosition {
  userId: string;
  userName: string;
  position: { line: number; ch: number };
}

export function DocumentManagement({ teamId }: { teamId: string }) {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Connect to Socket.IO
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      path: '/api/ws',
      autoConnect: true,
      withCredentials: true,
    });
    
    if (selectedDoc) {
      socket.emit('join-document', selectedDoc._id);

      socket.on('cursor-move', (cursor: CursorPosition) => {
        setCursors(prev => {
          const filtered = prev.filter(c => c.userId !== cursor.userId);
          return [...filtered, cursor];
        });
      });

      socket.on('document-updated', (data: {
        content: string;
        version: number;
        user: { id: string; name: string };
      }) => {
        if (selectedDoc) {
          setSelectedDoc(prev => prev ? {
            ...prev,
            content: data.content,
            version: data.version
          } : null);
        }
      });
    }

    setSocket(socket);

    return () => {
      if (selectedDoc) {
        socket.emit('leave-document', selectedDoc._id);
      }
      socket.disconnect();
    };
  }, [selectedDoc]);

  useEffect(() => {
    // Fetch documents
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents');
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []);

  const handleCursorMove = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (!selectedDoc || !session?.user) return;

    const textarea = e.currentTarget;
    const position = {
      line: textarea.value.substr(0, textarea.selectionStart).split('\n').length - 1,
      ch: textarea.selectionStart - textarea.value.lastIndexOf('\n', textarea.selectionStart - 1) - 1
    };

    socket?.emit('cursor-update', {
      documentId: selectedDoc._id,
      position
    });
  };

  const handleContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedDoc || !session?.user) return;

    const newContent = e.target.value;
    const newVersion = selectedDoc.version + 1;

    setSelectedDoc(prev => prev ? {
      ...prev,
      content: newContent,
      version: newVersion
    } : null);

    socket?.emit('document-update', {
      documentId: selectedDoc._id,
      content: newContent,
      version: newVersion
    });
  };

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {/* Document List Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <button
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <DocumentPlusIcon className="h-5 w-5 mr-2" />
            New Document
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <button
              key={doc._id}
              onClick={() => setSelectedDoc(doc)}
              className={`w-full text-left p-4 hover:bg-gray-50 ${
                selectedDoc?._id === doc._id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center">
                <DocumentDuplicateIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{doc.title}</h3>
                  <p className="text-xs text-gray-500">
                    Last modified: {new Date(doc.lastModified).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Document Editor */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedDoc ? (
          <>
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedDoc.title}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <ClockIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowShare(!showShare)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <ShareIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 flex">
              <div className="flex-1 p-4">
                <textarea
                  ref={editorRef}
                  value={selectedDoc.content}
                  onChange={handleContentChange}
                  onMouseMove={handleCursorMove}
                  className="w-full h-full resize-none border-0 focus:ring-0"
                />
                {/* Cursor Indicators */}
                {cursors.map((cursor) => (
                  <div
                    key={cursor.userId}
                    className="absolute pointer-events-none"
                    style={{
                      top: cursor.position.line * 20, // Approximate line height
                      left: cursor.position.ch * 8, // Approximate character width
                    }}
                  >
                    <div className="w-0.5 h-5 bg-blue-500" />
                    <div className="text-xs bg-blue-500 text-white px-1 rounded">
                      {cursor.userName}
                    </div>
                  </div>
                ))}
              </div>
              {/* Side Panels */}
              {showComments && (
                <div className="w-64 border-l border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Comments</h3>
                  {/* Comments implementation */}
                </div>
              )}
              {showHistory && (
                <div className="w-64 border-l border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Version History</h3>
                  {/* Version history implementation */}
                </div>
              )}
              {showShare && (
                <div className="w-64 border-l border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Share</h3>
                  {/* Sharing implementation */}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a document to start editing
          </div>
        )}
      </div>
    </div>
  );
} 