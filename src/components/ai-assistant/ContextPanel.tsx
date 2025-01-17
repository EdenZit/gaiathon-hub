'use client';

import { XIcon, ExternalLinkIcon } from 'lucide-react';
import { ContextPanelProps } from '@/types/ai-assistant';

const SAMPLE_RESOURCES = [
  {
    title: 'IoT Sensor Documentation',
    url: '#',
    type: 'documentation' as const,
  },
  {
    title: 'Remote Sensing Guide',
    url: '#',
    type: 'guide' as const,
  },
  {
    title: 'Earth Observation Tutorial',
    url: '#',
    type: 'tutorial' as const,
  },
];

export function ContextPanel({ activeTopic, onClose }: ContextPanelProps) {
  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium text-navy-900">Context & Resources</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        {activeTopic && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-600">Active Topic</h4>
            <p className="mt-1 text-sm text-navy-700">{activeTopic}</p>
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Related Resources</h4>
          <div className="space-y-2">
            {SAMPLE_RESOURCES.map((resource) => (
              <a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 text-sm text-navy-600 hover:bg-navy-50 rounded-lg group"
              >
                <span>{resource.title}</span>
                <ExternalLinkIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 