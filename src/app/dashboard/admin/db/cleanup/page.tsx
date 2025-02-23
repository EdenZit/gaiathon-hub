'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CollectionStats {
  users: number;
  blogPosts: number;
  gallery: number;
  announcements: number;
}

interface CleanupResult {
  success: boolean;
  dryRun: boolean;
  preserveAdmins: boolean;
  results: CollectionStats;
}

export default function DatabaseCleanupPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [preserveAdmins, setPreserveAdmins] = useState(true);
  const [dryRun, setDryRun] = useState(true);

  const collections = [
    { id: 'users', name: 'Users' },
    { id: 'blogPosts', name: 'Blog Posts' },
    { id: 'gallery', name: 'Gallery' },
    { id: 'announcements', name: 'Announcements' },
    { id: 'all', name: 'All Collections' }
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/db/cleanup');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data: CleanupResult = await response.json();
      setStats(data.results);
    } catch (error) {
      toast.error('Failed to fetch database statistics');
      console.error('Error fetching stats:', error);
    }
  };

  const handleCleanup = async () => {
    if (!selectedCollections.length) {
      toast.error('Please select at least one collection');
      return;
    }

    if (!dryRun) {
      const confirmed = window.confirm(
        'Are you sure you want to clean these collections? This action cannot be undone.'
      );
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/db/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collections: selectedCollections,
          preserveAdmins,
          dryRun
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clean database');
      }

      const result: CleanupResult = await response.json();
      setStats(result.results);
      
      toast.success(
        dryRun
          ? 'Dry run completed successfully'
          : 'Database cleanup completed successfully'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      console.error('Cleanup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionToggle = (collectionId: string) => {
    setSelectedCollections(prev => {
      if (collectionId === 'all') {
        // If 'all' is selected, remove other selections
        return prev.includes('all') ? [] : ['all'];
      } else {
        // If a specific collection is selected, remove 'all' if present
        const withoutAll = prev.filter(id => id !== 'all');
        if (withoutAll.includes(collectionId)) {
          return withoutAll.filter(id => id !== collectionId);
        } else {
          return [...withoutAll, collectionId];
        }
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Cleanup</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Statistics</h2>
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats).map(([collection, count]) => (
              <div key={collection} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 capitalize">
                  {collection.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-2xl font-semibold">{count}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">Loading statistics...</div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Cleanup Options</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Select Collections
            </h3>
            <div className="space-y-2">
              {collections.map(({ id, name }) => (
                <label key={id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(id)}
                    onChange={() => handleCollectionToggle(id)}
                    className="rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preserveAdmins}
                onChange={(e) => setPreserveAdmins(e.target.checked)}
                className="rounded border-gray-300 text-navy-600 focus:ring-navy-500"
              />
              <span>Preserve Admin Users</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="rounded border-gray-300 text-navy-600 focus:ring-navy-500"
              />
              <span>Dry Run (Preview Only)</span>
            </label>
          </div>

          <button
            onClick={handleCleanup}
            disabled={loading || selectedCollections.length === 0}
            className="w-full mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 disabled:opacity-50"
          >
            {loading
              ? 'Processing...'
              : dryRun
              ? 'Preview Cleanup'
              : 'Clean Database'}
          </button>
        </div>
      </div>
    </div>
  );
} 