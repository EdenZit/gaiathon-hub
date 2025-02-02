import { getServerSession } from 'next-auth';
import { User } from '@/lib/db/models/User';
import { Team } from '@/lib/db/models/Team';
import { Document } from '@/lib/db/models/Document';
import { connectDB } from '@/lib/mongodb';
import { IUser } from '@/types/models';
import { Types } from 'mongoose';
import { 
  UsersIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';

interface RecentUser {
  _id: Types.ObjectId;
  name?: string;
  email: string;
  createdAt: Date;
}

async function getStats() {
  await connectDB();
  
  const [totalUsers, totalTeams, totalDocuments] = await Promise.all([
    User.countDocuments(),
    Team.countDocuments(),
    Document.countDocuments()
  ]);

  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email createdAt')
    .lean();

  const recentActivity: RecentUser[] = users.map(user => ({
    _id: user._id as Types.ObjectId,
    name: user.name as string | undefined,
    email: user.email as string,
    createdAt: user.createdAt as Date
  }));

  return {
    totalUsers,
    totalTeams,
    totalDocuments,
    recentActivity
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      trend: '+5.25%',
      color: 'bg-blue-50'
    },
    {
      name: 'Active Teams',
      value: stats.totalTeams,
      icon: UserGroupIcon,
      trend: '+3.2%',
      color: 'bg-green-50'
    },
    {
      name: 'Documents Created',
      value: stats.totalDocuments,
      icon: DocumentTextIcon,
      trend: '+12.5%',
      color: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-gray-700">
          Monitor and manage your platform's activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className={`${stat.color} p-6 rounded-lg shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <Icon className="w-12 h-12 text-gray-400" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">{stat.trend}</span>
                <span className="ml-2 text-gray-600">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <div className="mt-6 flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {stats.recentActivity.map((user) => (
                <li key={user._id.toString()} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-navy-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-navy-700">
                          {user.name?.charAt(0) || user.email.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {user.name || user.email}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 