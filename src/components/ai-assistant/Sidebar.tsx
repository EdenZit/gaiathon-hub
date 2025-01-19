'use client';

import { SidebarProps, TopicCategory } from '@/types/ai-assistant';
import { 
  Download as DownloadIcon,
  Trash2 as TrashIcon,
  Satellite as SatelliteIcon,
  Eye as EyeIcon,
  Cpu as CpuIcon,
  Database as DatabaseIcon,
  BarChart as ChartIcon,
  BrainCircuit as MLIcon
} from 'lucide-react';

const CATEGORY_ICONS = {
  [TopicCategory.SATELLITE_DATA]: SatelliteIcon,
  [TopicCategory.REMOTE_SENSING]: EyeIcon,
  [TopicCategory.IOT_SENSORS]: CpuIcon,
  [TopicCategory.DATA_PROCESSING]: DatabaseIcon,
  [TopicCategory.VISUALIZATION]: ChartIcon,
  [TopicCategory.MACHINE_LEARNING]: MLIcon,
};

const CATEGORY_LABELS = {
  [TopicCategory.SATELLITE_DATA]: 'Satellite Data',
  [TopicCategory.REMOTE_SENSING]: 'Remote Sensing',
  [TopicCategory.IOT_SENSORS]: 'IoT Sensors',
  [TopicCategory.DATA_PROCESSING]: 'Data Processing',
  [TopicCategory.VISUALIZATION]: 'Visualization',
  [TopicCategory.MACHINE_LEARNING]: 'Machine Learning',
};

export function Sidebar({
  selectedCategory,
  onCategoryChange,
  onClearChat,
  onExport,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-navy-900 text-white p-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-6">AI Assistant</h2>
      
      <nav className="flex-1">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Categories</h3>
        <ul className="space-y-1">
          {Object.values(TopicCategory).map(category => {
            const Icon = CATEGORY_ICONS[category];
            return (
              <li key={category}>
                <button
                  onClick={() => onCategoryChange(category)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-navy-700 text-white'
                      : 'text-gray-300 hover:bg-navy-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{CATEGORY_LABELS[category]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="border-t border-navy-700 pt-4 mt-4 space-y-2">
        <button
          onClick={onClearChat}
          className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-navy-800 rounded-lg transition-colors"
        >
          <TrashIcon className="w-5 h-5" />
          <span>Clear Chat</span>
        </button>
        
        <button
          onClick={onExport}
          className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-navy-800 rounded-lg transition-colors"
        >
          <DownloadIcon className="w-5 h-5" />
          <span>Export Chat</span>
        </button>
      </div>
    </aside>
  );
} 