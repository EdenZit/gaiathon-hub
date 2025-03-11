import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import type { Document } from 'mongoose';
import type { User as AuthUser } from 'next-auth';

interface UserDocument extends Document {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  role: AuthUser['role'];
  status: AuthUser['status'];
  teamRole: AuthUser['teamRole'];
  comparePassword(password: string): Promise<boolean>;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials): Promise<AuthUser | null> {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing credentials');
            throw new Error('Invalid credentials');
          }

          await connectDB();
          const query = {
            email: credentials.email.toLowerCase(),
            ...(credentials.role === 'admin' ? { role: 'admin' } : {})
          };
          
          console.log('Looking for user with query:', { email: query.email });
          const user = await User.findOne(query) as UserDocument | null;
          
          if (!user) {
            console.error('User not found:', credentials.email);
            throw new Error('Invalid email or password');
          }

          console.log('User found:', { 
            email: user.email, 
            role: user.role, 
            status: user.status 
          });

          if (credentials.role === 'admin' && user.role !== 'admin') {
            console.error('Unauthorized admin access attempt');
            throw new Error('Unauthorized - Admin access required');
          }

          const isValidPassword = await user.comparePassword(credentials.password);
          console.log('Password validation result:', isValidPassword);

          if (!isValidPassword) {
            console.error('Invalid password for user:', credentials.email);
            throw new Error('Invalid email or password');
          }

          // Check if user status is explicitly set to inactive
          if (user.status === 'inactive') {
            console.error('Inactive account:', credentials.email);
            throw new Error('Account is inactive');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name || `${user.firstName} ${user.lastName}`,
            role: user.role,
            status: user.status || 'active',
            teamRole: user.teamRole
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error; // Let NextAuth handle the error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          role: user.role,
          status: user.status,
          teamRole: user.teamRole
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id,
          email: token.email,
          firstName: token.firstName,
          lastName: token.lastName,
          name: token.name,
          role: token.role,
          status: token.status,
          teamRole: token.teamRole
        }
      };
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
    newUser: '/register'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 