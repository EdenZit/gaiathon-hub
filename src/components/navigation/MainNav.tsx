'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Teams', href: '/teams', icon: UserGroupIcon },
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function MainNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Add admin link if user is an admin
  const navItems = [...navigation];
  if (session?.user?.role === 'admin') {
    navItems.push({
      name: 'Admin',
      href: '/admin',
      icon: ShieldCheckIcon,
    });
  }

  return (
    <nav className="flex space-x-4 lg:space-x-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isActive
                ? 'text-navy-700'
                : 'text-gray-700 hover:text-navy-600'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
} 