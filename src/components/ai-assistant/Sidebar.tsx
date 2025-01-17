'use client';

import { useState } from 'react';
import { HistoryIcon, BookmarkIcon, Settings2Icon } from 'lucide-react';
import { clsx } from 'clsx';

export function Sidebar() {
  const [activeSection, setActiveSection] = useState<'history' | 'saved' | null>(null);

  const navItems = [
    {
      id: 'history',
      label: 'History',
      icon: HistoryIcon,
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: BookmarkIcon,
    },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold text-navy-900">AI Assistant</h1>
        <p className="text-sm text-gray-600">IoT & Earth Observation</p>
      </div>
      
      <nav className="p-4 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(activeSection === item.id ? null : item.id as any)}
            className={clsx(
              'flex items-center w-full p-2 mb-2 text-left rounded transition-colors',
              'hover:bg-navy-50',
              activeSection === item.id ? 'bg-navy-50 text-navy-700' : 'text-gray-700'
            )}
          >
            <item.icon className="w-5 h-5 mr-2" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          className="flex items-center w-full p-2 text-left text-gray-700 hover:bg-navy-50 rounded transition-colors"
        >
          <Settings2Icon className="w-5 h-5 mr-2" />
          Settings
        </button>
      </div>
    </div>
  );
} 