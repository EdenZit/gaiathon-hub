'use client';

import { useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useTeam } from '@/contexts/TeamContext';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import {
  UsersIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

const navigation = [
  {
    name: 'Overview',
    href: 'overview',
    icon: UsersIcon,
  },
  {
    name: 'Members',
    href: 'members',
    icon: UsersIcon,
  },
];

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  const { currentTeam, setCurrentTeam, isLoading } = useTeam();
  const params = useParams();
  const pathname = usePathname();
  const teamId = params.teamId as string;

  useEffect(() => {
    if (teamId && (!currentTeam || currentTeam._id !== teamId)) {
      setCurrentTeam(teamId);
    }
  }, [teamId, currentTeam, setCurrentTeam]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (!currentTeam) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-theme(spacing.32))]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/resources/team-workspace"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Teams
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{currentTeam.name}</h1>
        </div>
      </div>

      <div className="flex gap-8">
        <nav className="w-64 flex-shrink-0">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.includes(`/${teamId}/${item.href}`);
              return (
                <Link
                  key={item.name}
                  href={`/resources/team-workspace/${teamId}/${item.href}`}
                  className={clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-navy-50 text-navy-700'
                      : 'text-gray-700 hover:text-navy-700 hover:bg-gray-50'
                  )}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 h-6 w-6',
                      isActive
                        ? 'text-navy-700'
                        : 'text-gray-400 group-hover:text-navy-700'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 