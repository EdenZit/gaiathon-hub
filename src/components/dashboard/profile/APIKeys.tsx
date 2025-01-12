'use client';

import { useState } from 'react';
import { KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface APIKey {
  id: string;
  name: string;
  key: string;
  platform: 'wekeo' | 'dunia';
  createdAt: string;
}

export function APIKeys() {
  const [showKey, setShowKey] = useState<string | null>(null);
  const [apiKeys] = useState<APIKey[]>([]);

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(showKey === keyId ? null : keyId);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              API Keys
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage your API keys for WEkEO and Dunia platforms.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add New Key
            </button>
          </div>
        </div>

        <div className="mt-6">
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No API keys
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your first API key to start using Earth Observation platforms.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {apiKeys.map((apiKey) => (
                <li key={apiKey.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {apiKey.name}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500">
                        Platform: {apiKey.platform.toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <code className="text-sm text-gray-600 font-mono">
                          {showKey === apiKey.id
                            ? apiKey.key
                            : '••••••••••••••••'}
                        </code>
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="ml-2 text-gray-400 hover:text-gray-500"
                        >
                          {showKey === apiKey.id ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 