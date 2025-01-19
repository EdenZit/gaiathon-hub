'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  GlobeAltIcon, 
  MapIcon, 
  ChartBarIcon, 
  CloudIcon, 
  CameraIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  comingSoon?: boolean;
}

const tools: Tool[] = [
  {
    id: 'satellite-imagery',
    name: 'Satellite Imagery Analysis',
    description: 'Process and analyze satellite imagery using AI-powered tools.',
    icon: GlobeAltIcon,
    category: 'Analysis'
  },
  {
    id: 'land-cover',
    name: 'Land Cover Classification',
    description: 'Classify land cover types using machine learning algorithms.',
    icon: MapIcon,
    category: 'Classification'
  },
  {
    id: 'climate-data',
    name: 'Climate Data Analytics',
    description: 'Analyze climate data patterns and trends.',
    icon: CloudIcon,
    category: 'Analytics'
  },
  {
    id: 'vegetation-indices',
    name: 'Vegetation Indices',
    description: 'Calculate and visualize vegetation health indices.',
    icon: ChartBarIcon,
    category: 'Monitoring'
  },
  {
    id: 'change-detection',
    name: 'Change Detection',
    description: 'Detect and analyze changes in Earth observation data.',
    icon: CameraIcon,
    category: 'Analysis',
    comingSoon: true
  },
  {
    id: 'data-fusion',
    name: 'Data Fusion',
    description: 'Combine multiple data sources for comprehensive analysis.',
    icon: BeakerIcon,
    category: 'Integration',
    comingSoon: true
  }
];

const categories = Array.from(new Set(tools.map(tool => tool.category)));

export default function EOTools() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (status === 'unauthenticated') {
    router.push('/register');
    return null;
  }

  const filteredTools = tools.filter(tool => {
    const matchesCategory = !selectedCategory || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Earth Observation Tools
          </h1>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Discover our collection of tools for Earth observation data analysis
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium
                ${!selectedCategory 
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium
                  ${selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map(tool => (
            <div
              key={tool.id}
              className={`relative group bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow
                ${tool.comingSoon ? 'opacity-75' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <tool.icon className="h-8 w-8 text-blue-600" />
                  <h3 className="ml-4 text-lg font-medium text-gray-900">{tool.name}</h3>
                </div>
                {tool.comingSoon && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Coming Soon
                  </span>
                )}
              </div>
              <p className="mt-4 text-gray-500">{tool.description}</p>
              {!tool.comingSoon && (
                <button
                  onClick={() => router.push(`/resources/tools/${tool.id}`)}
                  className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Launch Tool
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 