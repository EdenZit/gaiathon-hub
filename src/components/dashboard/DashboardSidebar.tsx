'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  UserCircleIcon,
  FolderIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: UserCircleIcon,
  },
  {
    name: 'Projects',
    href: '/dashboard/projects',
    icon: FolderIcon,
  },
  {
    name: 'Tools',
    href: '/dashboard/tools',
    icon: WrenchScrewdriverIcon,
  },
  {
    name: 'Collaboration',
    href: '/dashboard/collaboration',
    icon: UserGroupIcon,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col bg-white shadow">
      <div className="flex flex-grow flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={clsx(
                    'mr-3 h-6 w-6 flex-shrink-0',
                    isActive
                      ? 'text-blue-700'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 