'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@monaco-editor/react';
import { marked } from 'marked';
import {
  ArrowLeftIcon,
  UserPlusIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Document {
  _id: string;
  title: string;
  description: string;
  type: 'text' | 'code' | 'markdown';
  visibility: 'private' | 'team' | 'public';
  content: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  team?: {
    _id: string;
    name: string;
  };
  collaborators: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  updatedAt: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function DocumentEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/admin/documents/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch document');
        const data = await response.json();
        setDocument(data.document);
        setContent(data.document.content);
      } catch (error) {
        console.error('Error fetching document:', error);
        router.push('/admin/documents');
      }
    };

    fetchDocument();
  }, [params.id, router]);

  // Fetch available users for collaboration
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users?limit=all');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setAvailableUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (showCollaboratorModal) {
      fetchUsers();
    }
  }, [showCollaboratorModal]);

  // Autosave functionality
  const saveContent = useCallback(async () => {
    if (!document || content === document.content) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/documents/${document._id}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Failed to save document');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  }, [document, content]);

  useEffect(() => {
    const timer = setTimeout(saveContent, 2000);
    return () => clearTimeout(timer);
  }, [content, saveContent]);

  // Handle collaborator management
  const handleAddCollaborators = async () => {
    if (!document || !selectedUsers.length) return;

    try {
      const response = await fetch(`/api/admin/documents/${document._id}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers })
      });

      if (!response.ok) throw new Error('Failed to add collaborators');
      const data = await response.json();
      setDocument(data.document);
      setShowCollaboratorModal(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error adding collaborators:', error);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!document) return;

    try {
      const response = await fetch(`/api/admin/documents/${document._id}/collaborators`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: [userId] })
      });

      if (!response.ok) throw new Error('Failed to remove collaborator');
      const data = await response.json();
      setDocument(data.document);
    } catch (error) {
      console.error('Error removing collaborator:', error);
    }
  };

  // Handle document export
  const handleExport = () => {
    if (!document) return;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title}.${document.type === 'markdown' ? 'md' : 'txt'}`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!document) {
    return (
      <div className="animate-pulse p-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin/documents')}
                className="mr-4 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {document.title}
                </h1>
                <p className="text-sm text-gray-500">{document.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="h-5 w-5 mr-1" />
                {lastSaved
                  ? `Last saved ${lastSaved.toLocaleTimeString()}`
                  : saving
                  ? 'Saving...'
                  : 'All changes saved'}
              </div>
              <button
                onClick={() => setShowCollaboratorModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add Collaborators
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export
              </button>
              {document.type === 'markdown' && (
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {previewMode ? (
                    <>
                      <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                      Edit
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                      Preview
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow">
          {document.type === 'markdown' && previewMode ? (
            <div
              className="prose max-w-none p-6"
              dangerouslySetInnerHTML={{ __html: marked(content) }}
            />
          ) : (
            <Editor
              height="70vh"
              defaultLanguage={document.type === 'code' ? 'javascript' : 'plaintext'}
              defaultValue={content}
              onChange={(value: string | undefined) => setContent(value || '')}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                lineNumbers: document.type === 'code' ? 'on' : 'off',
                renderWhitespace: document.type === 'code' ? 'selection' : 'none',
                scrollBeyondLastLine: false
              }}
            />
          )}
        </div>

        {/* Collaborators List */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Collaborators</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              <li className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {document.owner.firstName} {document.owner.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{document.owner.email}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Owner
                  </span>
                </div>
              </li>
              {document.collaborators
                .filter((c) => c._id !== document.owner._id)
                .map((collaborator) => (
                  <li key={collaborator._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {collaborator.firstName} {collaborator.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{collaborator.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveCollaborator(collaborator._id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Add Collaborators Modal */}
      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add Collaborators</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Users
                </label>
                <select
                  multiple
                  value={selectedUsers}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, (option) => option.value);
                    setSelectedUsers(values);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  size={5}
                >
                  {availableUsers
                    .filter((user) => !document.collaborators.some((c) => c._id === user._id))
                    .map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCollaboratorModal(false);
                  setSelectedUsers([]);
                }}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCollaborators}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Selected Users
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
