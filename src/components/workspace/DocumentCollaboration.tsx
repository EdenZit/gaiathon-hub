'use client';

import { useState, useEffect, useCallback } from 'react';
import { Session } from 'next-auth';
import { io, Socket } from 'socket.io-client';
import { debounce } from 'lodash';
import { format } from 'date-fns';

interface Document {
  _id: string;
  title: string;
  content: string;
  type: 'text' | 'code' | 'markdown';
  lastEditedBy: {
    _id: string;
    name: string;
  };
  activeCollaborators: {
    user: {
      _id: string;
      name: string;
    };
    lastActive: Date;
  }[];
  version: number;
}

interface DocumentCollaborationProps {
  session: Session | null;
}

export default function DocumentCollaboration({ session }: DocumentCollaborationProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || '', {
      path: '/api/socketio',
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socketInstance.on('error', (error) => {
      console.error('Socket.IO error:', error);
      setError('Connection error occurred');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents');
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        setDocuments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Handle document selection
  const handleDocumentSelect = async (doc: Document) => {
    setSelectedDoc(doc);
    setContent(doc.content);

    if (socket) {
      socket.emit('join-document', { documentId: doc._id });
    }
  };

  // Debounced content update
  const debouncedUpdate = useCallback(
    debounce(async (docId: string, newContent: string, version: number) => {
      if (socket) {
        socket.emit('document-update', {
          documentId: docId,
          content: newContent,
          version: version + 1,
          userId: session?.user?.id
        });
      }
    }, 1000),
    [socket, session]
  );

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    if (selectedDoc) {
      setContent(newContent);
      debouncedUpdate(selectedDoc._id, newContent, selectedDoc.version);
    }
  };

  // Listen for document updates
  useEffect(() => {
    if (socket && selectedDoc) {
      socket.on('document-updated', (update: { content: string; version: number }) => {
        if (update.version > selectedDoc.version) {
          setContent(update.content);
          setSelectedDoc(prev => prev ? { ...prev, version: update.version } : null);
        }
      });

      socket.on('collaborator-joined', (data: { userId: string; timestamp: Date }) => {
        console.log('Collaborator joined:', data);
      });

      socket.on('collaborator-left', (data: { userId: string; timestamp: Date }) => {
        console.log('Collaborator left:', data);
      });

      return () => {
        socket.off('document-updated');
        socket.off('collaborator-joined');
        socket.off('collaborator-left');
      };
    }
  }, [socket, selectedDoc]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
      {/* Document List */}
      <div className="col-span-1 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Documents</h2>
        <div className="space-y-2">
          {documents.map((doc) => (
            <button
              key={doc._id}
              onClick={() => handleDocumentSelect(doc)}
              className={`w-full text-left p-3 rounded-md transition-colors ${
                selectedDoc?._id === doc._id
                  ? 'bg-navy text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <p className="font-medium truncate">{doc.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last edited by {doc.lastEditedBy.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Document Editor */}
      <div className="col-span-3 bg-white rounded-lg shadow-md p-4">
        {selectedDoc ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{selectedDoc.title}</h2>
              <div className="flex items-center space-x-2">
                {selectedDoc.activeCollaborators.map((collaborator) => (
                  <span
                    key={collaborator.user._id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {collaborator.user.name}
                  </span>
                ))}
              </div>
            </div>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="flex-1 w-full p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none font-mono"
              placeholder="Start typing..."
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a document to start editing
          </div>
        )}
      </div>
    </div>
  );
} 