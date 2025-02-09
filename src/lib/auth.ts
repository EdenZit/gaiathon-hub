import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import { Document } from 'mongoose';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    role: 'user' | 'admin';
    status: 'active' | 'inactive';
    teamRole: 'leader' | 'member';
  }

  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      name: string;
      role: 'user' | 'admin';
      status: 'active' | 'inactive';
      teamRole: 'leader' | 'member';
    };
    expires: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    role: 'user' | 'admin';
    status: 'active' | 'inactive';
    teamRole: 'leader' | 'member';
  }
}

interface UserDocument extends Document {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  teamRole: 'leader' | 'member';
  comparePassword(password: string): Promise<boolean>;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('DEBUG: Missing credentials');
            throw new Error('Invalid credentials');
          }

          await connectDB();
          console.error('DEBUG: Looking for user with email:', credentials.email.toLowerCase());
          
          const user = await User.findOne({ email: credentials.email.toLowerCase() }) as UserDocument;
          
          if (!user) {
            console.error('DEBUG: User not found');
            throw new Error('Invalid email or password');
          }

          console.error('DEBUG: Found user:', {
            email: user.email,
            role: user.role,
            status: user.status,
            name: user.name,
            teamRole: user.teamRole
          });

          const isValidPassword = await user.comparePassword(credentials.password);
          console.error('DEBUG: Password validation result:', isValidPassword);

          if (!isValidPassword) {
            console.error('DEBUG: Invalid password');
            throw new Error('Invalid email or password');
          }

          // Check if user is active
          if (user.status !== 'active') {
            console.error('DEBUG: User is inactive');
            throw new Error('Account is inactive');
          }

          const userData = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name || `${user.firstName} ${user.lastName}`,
            role: user.role as 'user' | 'admin',
            status: user.status as 'active' | 'inactive',
            teamRole: user.teamRole as 'leader' | 'member'
          };

          console.error('DEBUG: Login successful, returning user data:', userData);
          return userData;
        } catch (error) {
          console.error('DEBUG: Auth error:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.error('DEBUG: JWT callback - user data:', user);
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.name = user.name;
        token.role = user.role;
        token.status = user.status;
        token.teamRole = user.teamRole;
        console.error('DEBUG: JWT token after update:', token);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        console.error('DEBUG: Session callback - token data:', token);
        session.user = {
          id: token.id,
          email: token.email,
          firstName: token.firstName,
          lastName: token.lastName,
          name: token.name,
          role: token.role,
          status: token.status,
          teamRole: token.teamRole
        };
        console.error('DEBUG: Session after update:', session);
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}; 