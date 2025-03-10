'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MaintenanceToggle() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);

  // Fetch the current maintenance mode status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setWarning(null);
        
        const response = await fetch('/api/admin/maintenance', {
          // Add cache: 'no-store' to prevent caching issues
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch maintenance mode status');
        }
        
        const data = await response.json();
        setIsEnabled(data.maintenanceMode);
        setFetchAttempts(0); // Reset attempts on success
      } catch (err) {
        console.error('Error fetching maintenance status:', err);
        setError('Failed to load maintenance mode status');
        
        // Retry logic (up to 3 attempts)
        if (fetchAttempts < 3) {
          setFetchAttempts(prev => prev + 1);
          setTimeout(() => fetchStatus(), 1000); // Retry after 1 second
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStatus();
  }, [fetchAttempts]);

  // Toggle maintenance mode
  const toggleMaintenanceMode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setWarning(null);
      
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ enable: !isEnabled }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle maintenance mode');
      }
      
      const data = await response.json();
      setIsEnabled(data.maintenanceMode);
      
      if (data.warning) {
        setWarning(data.warning);
        toast.success(data.message + '. ' + data.warning);
      } else {
        toast.success(data.message + '. The change may take a few moments to take effect.');
      }
    } catch (err) {
      console.error('Error toggling maintenance mode:', err);
      setError('Failed to toggle maintenance mode');
      toast.error('Failed to toggle maintenance mode. Please try again or use the command line script.');
    } finally {
      setIsLoading(false);
    }
  };

  // If there's a persistent error, show a simplified version
  if (fetchAttempts >= 3 && error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>Unable to connect to maintenance service. Please use the command line script instead.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
        <div className="flex items-center">
          <Switch
            checked={isEnabled}
            onCheckedChange={toggleMaintenanceMode}
            disabled={isLoading}
            className="mr-2"
          />
          <span className={`text-sm font-medium ${isEnabled ? 'text-red-600' : 'text-green-600'}`}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
      
      <div className={`p-4 rounded-md ${isEnabled ? 'bg-red-50' : 'bg-green-50'}`}>
        {isEnabled ? (
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Site is in maintenance mode</p>
              <p className="text-sm text-red-700 mt-1">
                All users are being redirected to the maintenance page. Only API endpoints and static assets are accessible.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Site is operating normally</p>
              <p className="text-sm text-green-700 mt-1">
                All users can access the site as usual.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {warning && (
        <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>{warning}</div>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>
          When maintenance mode is enabled, all users will be redirected to a maintenance page.
          This is useful when performing updates or fixing issues on the site.
        </p>
        <p className="mt-2">
          <strong>Note:</strong> Toggling maintenance mode will restart the web server, which may take a few moments.
        </p>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}. Please try again or use the command line script.</div>
        </div>
      )}
    </div>
  );
} 