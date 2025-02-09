'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTeam } from '@/contexts/TeamContext';
import { toast } from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';
import {
  DocumentIcon,
  ArrowUpTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface TeamDocumentsProps {
  selectedTeam: string;
}

export default function TeamDocuments({ selectedTeam }: TeamDocumentsProps) {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { currentTeam } = useTeam();

  useEffect(() => {
    fetchDocuments();
  }, [selectedTeam]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/teams/${selectedTeam}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/teams/${selectedTeam}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload document');
      
      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(
        `/api/teams/${selectedTeam}/documents/${documentId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete document');
      
      toast.success('Document deleted successfully');
      setDocuments(docs => docs.filter(doc => doc.id !== documentId));
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Team Documents</h2>
        <div>
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center px-4 py-2 rounded-md bg-navy-600 text-white text-sm font-medium hover:bg-navy-700 focus:outline-none ${
              isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {isUploading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                Upload Document
              </>
            )}
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading a document
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <li key={doc.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentIcon className="h-8 w-8 text-gray-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <div className="flex space-x-4 text-xs text-gray-500">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span>
                          Uploaded by{' '}
                          {doc.uploadedBy.id === session?.user?.id
                            ? 'you'
                            : `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}`}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 