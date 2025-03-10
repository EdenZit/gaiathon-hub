'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  useEffect(() => {
    const performSignOut = async () => {
      await signOut({ callbackUrl: '/' });
    };
    
    performSignOut();
  }, []);

  return null;
} 