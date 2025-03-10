'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MaintenanceToggle() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the current maintenance mode status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/maintenance');
        
        if (!response.ok) {
          throw new Error('Failed to fetch maintenance mode status');
        }
        
        const data = await response.json();
        setIsEnabled(data.maintenanceMode);
      } catch (err) {
        setError('Failed to load maintenance mode status');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStatus();
  }, []);

  // Toggle maintenance mode
  const toggleMaintenanceMode = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enable: !isEnabled }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle maintenance mode');
      }
      
      const data = await response.json();
      setIsEnabled(data.maintenanceMode);
      
      toast.success(data.message, {
        description: 'The change may take a few moments to take effect.',
      });
    } catch (err) {
      setError('Failed to toggle maintenance mode');
      toast.error('Failed to toggle maintenance mode', {
        description: 'Please try again or use the command line script.',
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}. Please try again or use the command line script.
        </div>
      )}
    </div>
  );
} 