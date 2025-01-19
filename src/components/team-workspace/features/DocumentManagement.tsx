'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  DocumentPlusIcon, 
  DocumentDuplicateIcon,
  TrashIcon,
  ShareIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface Document {
  _id: string;
  title: string;
  content: string;
  format: string;
  createdBy: string;
  lastModified: string;
  version: number;
  sharedWith: Array<{ userId: string; role: string }>;
  isEncrypted: boolean;
}

interface DocumentManagementProps {
  teamId: string;
  isTeamLeader: boolean;
}

export default function DocumentManagement({ teamId, isTeamLeader }: DocumentManagementProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSharing, setShowSharing] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`/api/team/${teamId}/documents`);
        if (response.ok) {
          const data = await response.json();
          setDocuments(data.documents);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [teamId]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      path: '/api/ws',
      autoConnect: true,
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      if (selectedDoc) {
        socket.emit('join-document', { documentId: selectedDoc._id });
      }
    });

    socket.on('document-updated', (updatedDoc) => {
      setDocuments(docs => docs.map(doc => 
        doc._id === updatedDoc._id ? updatedDoc : doc
      ));
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [selectedDoc]);

  const handleCreateDocument = async () => {
    try {
      const response = await fetch(`/api/team/${teamId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Document',
          content: '',
          format: 'text'
        })
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocuments([...documents, newDoc]);
        setSelectedDoc(newDoc);
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleDocumentChange = async (content: string) => {
    if (!selectedDoc) return;

    try {
      socket?.emit('document-update', {
        documentId: selectedDoc._id,
        content,
        version: selectedDoc.version + 1
      });

      const response = await fetch(`/api/team/${teamId}/documents/${selectedDoc._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const updatedDoc = await response.json();
        setSelectedDoc(updatedDoc);
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Document List */}
      <div className="col-span-1 bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <button
            onClick={handleCreateDocument}
            className="flex items-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <DocumentPlusIcon className="h-5 w-5" />
            New Document
          </button>
        </div>
        <div className="p-2">
          {documents.map(doc => (
            <button
              key={doc._id}
              onClick={() => setSelectedDoc(doc)}
              className={`flex items-center gap-2 w-full p-2 rounded text-left
                ${selectedDoc?._id === doc._id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
            >
              <DocumentDuplicateIcon className="h-5 w-5" />
              <span className="truncate">{doc.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Document Editor */}
      <div className="col-span-3">
        {selectedDoc ? (
          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-4 border-b">
              <input
                type="text"
                value={selectedDoc.title}
                onChange={(e) => {
                  setSelectedDoc({ ...selectedDoc, title: e.target.value });
                  handleDocumentChange(selectedDoc.content);
                }}
                className="text-lg font-medium bg-transparent border-none focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className={`p-2 rounded hover:bg-gray-100 ${showComments ? 'text-blue-600' : ''}`}
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2 rounded hover:bg-gray-100 ${showHistory ? 'text-blue-600' : ''}`}
                >
                  <ClockIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowSharing(!showSharing)}
                  className={`p-2 rounded hover:bg-gray-100 ${showSharing ? 'text-blue-600' : ''}`}
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
                {isTeamLeader && (
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this document?')) {
                        try {
                          await fetch(`/api/team/${teamId}/documents/${selectedDoc._id}`, {
                            method: 'DELETE'
                          });
                          setDocuments(documents.filter(d => d._id !== selectedDoc._id));
                          setSelectedDoc(null);
                        } catch (error) {
                          console.error('Error deleting document:', error);
                        }
                      }
                    }}
                    className="p-2 rounded hover:bg-red-100 text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={selectedDoc.content}
                onChange={(e) => handleDocumentChange(e.target.value)}
                className="w-full h-96 p-4 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start typing..."
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow">
            <DocumentDuplicateIcon className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">Select a document to edit</p>
          </div>
        )}
      </div>
    </div>
  );
} 