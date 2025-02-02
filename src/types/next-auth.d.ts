import NextAuth from 'next-auth';
import { DefaultSession } from 'next-auth';
import { ObjectId } from 'mongoose';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      firstName?: string;
      lastName?: string;
      role?: 'user' | 'admin';
      teams?: string[];
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    name?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: 'user' | 'admin';
    teams?: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    role?: 'user' | 'admin';
  }
} 