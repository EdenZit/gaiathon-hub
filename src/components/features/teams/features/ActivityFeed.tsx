'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { 
  DocumentIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  BellIcon,
  FunnelIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Activity {
  _id: string;
  type: 'document' | 'chat' | 'calendar' | 'task' | 'member';
  action: string;
  details: {
    title?: string;
    description?: string;
    status?: string;
    name?: string;
  };
  author: {
    email: string;
    name: string;
  };
  timestamp: string;
  isRead: boolean;
}

interface ActivityFeedProps {
  teamId: string;
  isTeamLeader: boolean;
}

const activityIcons = {
  document: DocumentIcon,
  chat: ChatBubbleLeftIcon,
  calendar: CalendarIcon,
  task: ChartBarIcon,
  member: UserGroupIcon
};

export default function ActivityFeed({ teamId, isTeamLeader }: ActivityFeedProps) {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [filter, setFilter] = useState<Activity['type'] | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      path: '/api/ws',
      autoConnect: true,
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Connected to activity WebSocket');
      socket.emit('join-team', { teamId });
    });

    socket.on('activity', (activity: Activity) => {
      setActivities(prev => [activity, ...prev]);
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [teamId]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/team/${teamId}/activities?${new URLSearchParams({
          type: filter === 'all' ? '' : filter,
          unreadOnly: showUnreadOnly.toString()
        })}`);
        
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, [teamId, filter, showUnreadOnly]);

  const handleMarkAsRead = async (activityId: string) => {
    try {
      const response = await fetch(`/api/team/${teamId}/activities/${activityId}/read`, {
        method: 'PUT'
      });

      if (response.ok) {
        setActivities(activities.map(activity => 
          activity._id === activityId ? { ...activity, isRead: true } : activity
        ));
      }
    } catch (error) {
      console.error('Error marking activity as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(`/api/team/${teamId}/activities/read-all`, {
        method: 'PUT'
      });

      if (response.ok) {
        setActivities(activities.map(activity => ({ ...activity, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking all activities as read:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-gray-900">Activity Feed</h2>
            <div className="flex rounded-lg shadow-sm">
              {(['all', 'document', 'chat', 'calendar', 'task', 'member'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 text-sm font-medium first:rounded-l-lg last:rounded-r-lg
                    ${filter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    } border border-gray-200`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border
                ${showUnreadOnly
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
            >
              <FunnelIcon className="h-5 w-5" />
              Unread Only
            </button>
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Mark All as Read
            </button>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        {activities.map(activity => {
          const Icon = activityIcons[activity.type];
          return (
            <div
              key={activity._id}
              className={`p-4 hover:bg-gray-50 ${!activity.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ${!activity.isRead ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  <Icon className={`h-5 w-5 ${!activity.isRead ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.author.name}
                      <span className="text-gray-500"> {activity.action} </span>
                      {activity.details.title && (
                        <span className="font-medium">{activity.details.title}</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                      {!activity.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(activity._id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {activity.details.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {activity.details.description}
                    </p>
                  )}
                  {activity.details.status && (
                    <p className="mt-1 text-sm">
                      Status: <span className="font-medium">{activity.details.status}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 