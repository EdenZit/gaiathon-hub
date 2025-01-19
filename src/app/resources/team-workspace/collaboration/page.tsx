import type { Metadata } from 'next';
import { ChatBubbleLeftRightIcon, DocumentIcon, VideoCameraIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Collaboration Dashboard | GAIAthon-Hub',
  description: 'Collaborate with your team, share resources, and communicate effectively during your GAIAthon project.',
};

const teams = [
  {
    id: 1,
    name: 'Team Coastal Guardians',
    members: [
      { name: 'Sarah Kumar', role: 'Team Lead', avatar: '/images/avatars/avatar1.jpg' },
      { name: 'John Doe', role: 'Data Scientist', avatar: '/images/avatars/avatar2.jpg' },
      { name: 'Mike Ross', role: 'GIS Expert', avatar: '/images/avatars/avatar3.jpg' },
    ],
    nextMeeting: 'Today at 3:00 PM',
    project: 'Coastal Monitoring System',
  },
  {
    id: 2,
    name: 'AgroTech Innovators',
    members: [
      { name: 'Emma Lee', role: 'Team Lead', avatar: '/images/avatars/avatar4.jpg' },
      { name: 'David Miller', role: 'ML Engineer', avatar: '/images/avatars/avatar5.jpg' },
    ],
    nextMeeting: 'Tomorrow at 10:00 AM',
    project: 'Agricultural Yield Predictor',
  },
];

const sharedResources = [
  {
    id: 1,
    title: 'Project Documentation',
    type: 'document',
    updatedAt: '2 hours ago',
    size: '2.4 MB',
  },
  {
    id: 2,
    title: 'Team Meeting Recording',
    type: 'video',
    updatedAt: '1 day ago',
    size: '156 MB',
  },
  {
    id: 3,
    title: 'Data Analysis Report',
    type: 'document',
    updatedAt: '3 days ago',
    size: '4.2 MB',
  },
];

const activities = [
  {
    id: 1,
    user: 'Sarah Kumar',
    action: 'uploaded',
    target: 'new satellite imagery dataset',
    time: '30 minutes ago',
  },
  {
    id: 2,
    user: 'John Doe',
    action: 'commented on',
    target: 'data processing methodology',
    time: '2 hours ago',
  },
  {
    id: 3,
    user: 'Emma Lee',
    action: 'scheduled',
    target: 'team sync meeting',
    time: '4 hours ago',
  },
];

export default function CollaborationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Team Collaboration</h1>
          <p className="mt-2 text-gray-600">
            Work together with your team members and share resources
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Teams Section */}
            <section className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Teams</h2>
                <div className="space-y-6">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                          <p className="text-sm text-gray-500">{team.project}</p>
                        </div>
                        <Link
                          href="#"
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                        >
                          View Details
                        </Link>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {team.members.map((member) => (
                            <div
                              key={member.name}
                              className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white"
                              title={`${member.name} - ${member.role}`}
                            >
                              <div className="relative h-full w-full">
                                <Image
                                  src={member.avatar}
                                  alt={member.name}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">
                          Next Meeting: {team.nextMeeting}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Shared Resources */}
            <section className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shared Resources</h2>
                <div className="space-y-4">
                  {sharedResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        {resource.type === 'document' ? (
                          <DocumentIcon className="h-6 w-6 text-gray-400" />
                        ) : (
                          <VideoCameraIcon className="h-6 w-6 text-gray-400" />
                        )}
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">{resource.title}</h3>
                          <p className="text-sm text-gray-500">
                            {resource.updatedAt} • {resource.size}
                          </p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <section className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'New Meeting', icon: VideoCameraIcon },
                  { name: 'Chat', icon: ChatBubbleLeftRightIcon },
                  { name: 'Share Files', icon: DocumentIcon },
                  { name: 'Team Info', icon: UserGroupIcon },
                ].map((action) => (
                  <button
                    key={action.name}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <action.icon className="h-6 w-6 text-gray-600" />
                    <span className="mt-2 text-sm font-medium text-gray-900">{action.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Recent Activity */}
            <section className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {activity.user.split(' ')[0][0]}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{activity.user}</span>{' '}
                        {activity.action}{' '}
                        <span className="font-medium text-gray-900">{activity.target}</span>
                      </p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 