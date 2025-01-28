'use client';

import { useSession } from 'next-auth/react';
import UserProfile from '@/components/dashboard/profile/UserProfile';

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mt-6">
        <UserProfile />
      </div>
    </div>
  );
} 