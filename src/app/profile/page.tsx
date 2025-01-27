'use client';

import UserProfile from '@/components/dashboard/profile/UserProfile';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mountKey, setMountKey] = useState(Date.now());

  const refreshData = useCallback(() => {
    console.log('Refreshing profile data...');
    setMountKey(Date.now());
  }, []);

  useEffect(() => {
    if (!session?.user) {
      router.push('/register');
      return;
    }

    // Refresh data when the component mounts
    refreshData();
  }, [session, router, refreshData]);

  useEffect(() => {
    // Force refresh when the page gains focus
    const handleFocus = () => {
      console.log('Window focused, refreshing data...');
      refreshData();
    };

    // Force refresh when the page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible, refreshing data...');
        refreshData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshData]);

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UserProfile key={mountKey} />
      </div>
    </div>
  );
} 