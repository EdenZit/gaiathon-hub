'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { clsx } from 'clsx';
import {
  UserCircleIcon,
  WrenchScrewdriverIcon,
  Squares2X2Icon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & { title?: string | undefined; titleId?: string | undefined; } & RefAttributes<SVGSVGElement>>;
  adminHref?: string;
  requireAdmin?: boolean;
}

const navigation: NavItem[] = [
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: UserCircleIcon,
  },
  {
    name: 'Team',
    href: '/resources/team-workspace',
    icon: UserGroupIcon,
    requireAdmin: false,
  },
  {
    name: 'EO Tools',
    href: '/dashboard/tools',
    icon: WrenchScrewdriverIcon,
  },
];

const adminNavigation: NavItem[] = [
  {
    name: 'Admin Panel',
    href: '/dashboard/admin',
    icon: ShieldCheckIcon,
    requireAdmin: true,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const getHref = (item: NavItem) => {
    if (isAdmin && item.adminHref && pathname.startsWith('/dashboard/admin')) {
      return item.adminHref;
    }
    return item.href;
  };

  const allNavItems = [
    ...navigation,
    ...(isAdmin ? adminNavigation : []),
  ];

  return (
    <div className="flex w-64 flex-col bg-white shadow">
      <div className="flex flex-grow flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {allNavItems.map((item) => {
            const href = getHref(item);
            const isActive = pathname === href || 
              (item.adminHref && pathname.startsWith('/dashboard/admin'));
            
            if ((item.requireAdmin && !isAdmin) || (isAdmin && item.requireAdmin === false)) return null;

            return (
              <Link
                key={item.name}
                href={href}
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