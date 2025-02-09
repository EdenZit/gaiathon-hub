'use client';

import { useState, useEffect } from 'react';
import { withAdminGuard } from '@/components/auth/AdminGuard';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';

interface SystemSettings {
  maintenance: {
    enabled: boolean;
    message: string;
  };
  registration: {
    enabled: boolean;
    requireEmailVerification: boolean;
    allowedDomains: string[];
  };
  security: {
    maxLoginAttempts: number;
    sessionTimeout: number;
    requireMFA: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    slackEnabled: boolean;
    webhookUrl?: string;
  };
}

function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load settings');
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Maintenance Mode */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Maintenance Mode</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Enable Maintenance Mode</label>
              <input
                type="checkbox"
                checked={settings.maintenance.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  maintenance: { ...settings.maintenance, enabled: e.target.checked }
                })}
                className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maintenance Message
              </label>
              <textarea
                value={settings.maintenance.message}
                onChange={(e) => setSettings({
                  ...settings,
                  maintenance: { ...settings.maintenance, message: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Registration Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Registration Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Enable Registration</label>
              <input
                type="checkbox"
                checked={settings.registration.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  registration: { ...settings.registration, enabled: e.target.checked }
                })}
                className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Require Email Verification</label>
              <input
                type="checkbox"
                checked={settings.registration.requireEmailVerification}
                onChange={(e) => setSettings({
                  ...settings,
                  registration: { ...settings.registration, requireEmailVerification: e.target.checked }
                })}
                className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Require MFA</label>
              <input
                type="checkbox"
                checked={settings.security.requireMFA}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, requireMFA: e.target.checked }
                })}
                className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Enable Email Notifications</label>
              <input
                type="checkbox"
                checked={settings.notifications.emailEnabled}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, emailEnabled: e.target.checked }
                })}
                className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Enable Slack Notifications</label>
              <input
                type="checkbox"
                checked={settings.notifications.slackEnabled}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, slackEnabled: e.target.checked }
                })}
                className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded"
              />
            </div>
            {settings.notifications.slackEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="text"
                  value={settings.notifications.webhookUrl || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, webhookUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAdminGuard(SettingsPage); 