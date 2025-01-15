import type { Metadata } from 'next';
import { 
  DocumentIcon, 
  ChatBubbleLeftRightIcon, 
  CalendarIcon, 
  ChartBarIcon,
  CloudArrowUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Team Workspace | GAIAthon-Hub',
  description: 'Access your team workspace, manage documents, and collaborate with team members on your GAIAthon project.',
};

const workspaceFeatures = [
  {
    name: 'Document Management',
    description: 'Store and organize project documentation, code, and research papers.',
    icon: DocumentIcon,
    link: '/resources/team-workspace/documents'
  },
  {
    name: 'Team Chat',
    description: 'Real-time communication with your team members.',
    icon: ChatBubbleLeftRightIcon,
    link: '/resources/team-workspace/chat'
  },
  {
    name: 'Project Timeline',
    description: 'Track milestones, deadlines, and team meetings.',
    icon: CalendarIcon,
    link: '/resources/team-workspace/timeline'
  },
  {
    name: 'Progress Tracking',
    description: 'Monitor project progress and team performance.',
    icon: ChartBarIcon,
    link: '/resources/team-workspace/progress'
  },
  {
    name: 'File Storage',
    description: 'Upload and share project files, datasets, and resources.',
    icon: CloudArrowUpIcon,
    link: '/resources/team-workspace/files'
  },
  {
    name: 'Team Management',
    description: 'Manage team members, roles, and responsibilities.',
    icon: UserGroupIcon,
    link: '/resources/team-workspace/team'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'document',
    title: 'Project Proposal',
    action: 'updated',
    user: 'Sarah Kumar',
    time: '2 hours ago'
  },
  {
    id: 2,
    type: 'chat',
    title: 'Team Discussion',
    action: 'commented in',
    user: 'John Doe',
    time: '4 hours ago'
  },
  {
    id: 3,
    type: 'file',
    title: 'Satellite Data',
    action: 'uploaded',
    user: 'Mike Ross',
    time: '1 day ago'
  }
];

export default function TeamWorkspacePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Team Workspace</h1>
          <p className="mt-2 text-gray-600">
            Access tools and resources for effective team collaboration
          </p>
        </div>

        {/* Workspace Features Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {workspaceFeatures.map((feature) => (
            <Link
              key={feature.name}
              href={feature.link}
              className="group relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'document' ? (
                        <DocumentIcon className="h-5 w-5 text-gray-400" />
                      ) : activity.type === 'chat' ? (
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <CloudArrowUpIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user} {activity.action} {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
            <Link
              href="/resources/team-workspace/activity"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View all activity →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 