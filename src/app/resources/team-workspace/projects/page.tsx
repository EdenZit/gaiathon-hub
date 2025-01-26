import type { Metadata } from 'next';
import { FolderIcon, ClockIcon, UserGroupIcon, TagIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Projects Dashboard | GAIAthon-Hub',
  description: 'Manage and track your GAIAthon projects, view progress, and collaborate with team members.',
};

// Sample project data - to be replaced with actual data from API
const projects = [
  {
    id: 1,
    title: 'Coastal Monitoring System',
    description: 'AI-powered system for monitoring coastal erosion and changes using satellite imagery.',
    status: 'In Progress',
    progress: 65,
    team: ['Sarah K.', 'John D.', 'Mike R.'],
    tags: ['AI/ML', 'Coastal', 'Remote Sensing'],
    dueDate: 'June 15, 2025',
  },
  {
    id: 2,
    title: 'Agricultural Yield Predictor',
    description: 'Machine learning model for crop yield prediction using Earth Observation data.',
    status: 'Planning',
    progress: 25,
    team: ['Emma L.', 'David M.'],
    tags: ['Agriculture', 'ML', 'Data Analysis'],
    dueDate: 'June 15, 2025',
  },
  {
    id: 3,
    title: 'Urban Heat Mapping',
    description: 'Thermal mapping solution for urban areas to identify heat islands and plan mitigation.',
    status: 'Not Started',
    progress: 0,
    team: ['Alex P.', 'Maria S.', 'James W.'],
    tags: ['Urban', 'Climate', 'Mapping'],
    dueDate: 'June 15, 2025',
  },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Projects Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Track and manage your GAIAthon projects
          </p>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: 'Total Projects', value: '3', icon: FolderIcon },
            { label: 'In Progress', value: '1', icon: ClockIcon },
            { label: 'Team Members', value: '8', icon: UserGroupIcon },
            { label: 'Categories', value: '6', icon: TagIcon },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{project.title}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      project.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : project.status === 'Planning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{project.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Team</h3>
                    <div className="mt-1 flex -space-x-1">
                      {project.team.map((member, index) => (
                        <div
                          key={index}
                          className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white"
                          title={member}
                        >
                          <span className="text-xs font-medium">{member.split(' ')[0][0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                    <p className="mt-1 text-sm text-gray-900">{project.dueDate}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 