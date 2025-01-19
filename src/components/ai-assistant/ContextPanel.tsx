'use client';

import React from 'react';
import { ContextPanelProps, Topic, TopicCategory } from '@/types/ai-assistant';
import { 
  X as CloseIcon,
  ExternalLink as ExternalLinkIcon,
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

const SAMPLE_TOPICS: Topic[] = [
  {
    id: 'sentinel',
    category: TopicCategory.SATELLITE_DATA,
    title: 'Sentinel Satellite Data',
    description: 'Understanding and working with Sentinel satellite data for Earth observation.',
    resources: [
      {
        id: 'sentinel-guide',
        title: 'Sentinel User Guide',
        url: 'https://sentinel.esa.int/web/sentinel/user-guides',
        type: 'documentation',
        description: 'Official ESA guide for Sentinel data',
        tags: ['sentinel', 'esa', 'guide'],
      },
      {
        id: 'sentinel-hub',
        title: 'Sentinel Hub',
        url: 'https://www.sentinel-hub.com/',
        type: 'tool',
        description: 'Platform for Sentinel data access and processing',
        tags: ['sentinel', 'processing', 'platform'],
      },
    ],
  },
  {
    id: 'iot-sensors',
    category: TopicCategory.IOT_SENSORS,
    title: 'Environmental IoT Sensors',
    description: 'Deploying and managing IoT sensors for environmental monitoring.',
    resources: [
      {
        id: 'sensor-guide',
        title: 'Environmental Sensing Guide',
        url: 'https://www.example.com/sensor-guide',
        type: 'tutorial',
        description: 'Guide to environmental sensor deployment',
        tags: ['iot', 'sensors', 'environment'],
      },
    ],
  },
];

export function ContextPanel({
  topic,
  onClose,
  onTopicSelect,
}: ContextPanelProps) {
  const renderCategoryIcon = (category: TopicCategory) => {
    const Icon = CATEGORY_ICONS[category];
    return Icon ? (
      <div className="p-1 bg-navy-100 rounded-lg">
        <Icon className="w-5 h-5 text-navy-600" />
      </div>
    ) : null;
  };

  return (
    <div className="w-80 bg-white border-l flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-medium text-navy-900">
          Context & Resources
        </h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {topic ? (
          <>
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                {renderCategoryIcon(topic.category)}
                <h3 className="text-lg font-medium text-navy-900">
                  {topic.title}
                </h3>
              </div>
              <p className="text-gray-600">{topic.description}</p>
            </div>

            {topic.resources.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  Related Resources
                </h4>
                <div className="space-y-3">
                  {topic.resources.map(resource => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg border hover:border-navy-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-navy-900">
                          {resource.title}
                        </h5>
                        <ExternalLinkIcon className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {resource.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded-full bg-navy-100 text-navy-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Select a topic to view related resources and context.
            </p>
            
            <div className="space-y-3">
              {SAMPLE_TOPICS.map(sampleTopic => (
                <button
                  key={sampleTopic.id}
                  onClick={() => onTopicSelect(sampleTopic)}
                  className="w-full p-3 text-left rounded-lg border hover:border-navy-300 transition-colors"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {renderCategoryIcon(sampleTopic.category)}
                    <h3 className="font-medium text-navy-900">
                      {sampleTopic.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {sampleTopic.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 