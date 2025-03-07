import NextAuth, { AuthOptions, DefaultSession, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import { IUser } from '@/types/models';
import { Types, Document } from 'mongoose';
import { authOptions } from '@/lib/auth';

interface ExtendedUser extends NextAuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  firstName: string;
  lastName: string;
  teamRole: 'leader' | 'member';
  status: 'active' | 'inactive';
}

interface UserDocument extends Omit<IUser, '_id'>, Document {
  _id: Types.ObjectId;
  comparePassword(password: string): Promise<boolean>;
}

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: ExtendedUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends ExtendedUser {}
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 