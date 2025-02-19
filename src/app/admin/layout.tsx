'use client';

import { useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  UsersIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Database', href: '/admin/database', icon: CircleStackIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Teams', href: '/admin/teams', icon: UserGroupIcon },
  { name: 'Documents', href: '/admin/documents', icon: DocumentTextIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Add console logging for debugging
  console.log('Current pathname:', pathname);
  console.log('Session status:', status);
  console.log('User role:', session?.user?.role);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="h-16 flex items-center px-6 border-b">
            <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
          </div>
          <nav className="mt-6 px-4">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href); // Changed to startsWith for better matching
              console.log(`Nav item: ${item.name}, Path: ${item.href}, Active: ${isActive}`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-4 py-3 text-gray-600 rounded-md transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-600" 
                      : "hover:bg-blue-50 hover:text-blue-600"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <header className="h-16 bg-white shadow-sm flex items-center px-8">
            <div className="flex-1"></div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session.user.email}
              </span>
            </div>
          </header>
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 