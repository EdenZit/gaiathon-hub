'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { TeamProvider } from '@/contexts/TeamContext';
import { Spinner } from '@/components/ui/Spinner';

export default function TeamWorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/register');
    },
  });

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <TeamProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </TeamProvider>
  );
} 