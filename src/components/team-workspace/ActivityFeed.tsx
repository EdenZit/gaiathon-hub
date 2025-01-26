'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  DocumentIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  UserGroupIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  _id: string;
  type: 'document' | 'chat' | 'calendar' | 'progress' | 'team';
  action: string;
  details: {
    title?: string;
    message?: string;
    user?: {
      name: string;
      id: string;
    };
    target?: string;
  };
  timestamp: Date;
  isRead: boolean;
}

export function ActivityFeed() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<Activity['type'] | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Fetch initial activities
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities');
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    if (session?.user?.id) {
      fetchActivities();

      // Initialize WebSocket connection
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        const newActivity = JSON.parse(event.data);
        setActivities(prev => [newActivity, ...prev]);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setSocket(ws);

      return () => {
        ws.close();
      };
    }
  }, [session?.user?.id]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'document':
        return <DocumentIcon className="h-5 w-5 text-blue-500" />;
      case 'chat':
        return <ChatBubbleLeftIcon className="h-5 w-5 text-green-500" />;
      case 'calendar':
        return <CalendarIcon className="h-5 w-5 text-purple-500" />;
      case 'progress':
        return <CheckCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'team':
        return <UserGroupIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const markAsRead = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setActivities(prev =>
          prev.map(activity =>
            activity._id === activityId
              ? { ...activity, isRead: true }
              : activity
          )
        );
      }
    } catch (error) {
      console.error('Error marking activity as read:', error);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (showUnreadOnly && activity.isRead) return false;
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Activity Feed</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm ${
                showUnreadOnly
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <BellIcon className="h-4 w-4 mr-1" />
              Unread Only
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          {['all', 'document', 'chat', 'calendar', 'progress', 'team'].map(
            (type) => (
              <button
                key={type}
                onClick={() => setFilter(type as Activity['type'] | 'all')}
                className={`pb-4 px-1 text-sm font-medium ${
                  filter === type
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {filteredActivities.map((activity) => (
            <div
              key={activity._id}
              className={`flex items-start space-x-4 p-4 rounded-lg ${
                activity.isRead ? 'bg-white' : 'bg-blue-50'
              }`}
              onClick={() => !activity.isRead && markAsRead(activity._id)}
            >
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.details.user?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-600">{activity.action}</p>
                {activity.details.title && (
                  <p className="mt-1 text-sm text-gray-500">
                    {activity.details.title}
                  </p>
                )}
                {activity.details.message && (
                  <p className="mt-1 text-sm text-gray-500">
                    {activity.details.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 