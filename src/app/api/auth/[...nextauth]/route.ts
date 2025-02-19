import NextAuth, { AuthOptions, DefaultSession, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import { IUser } from '@/types/models';
import { Types, Document } from 'mongoose';

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

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        await connectDB();
        
        const user = await User.findOne({ email: credentials.email.toLowerCase() }) as UserDocument | null;
        if (!user) {
          throw new Error('No user found with this email');
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        // Convert Mongoose document to plain object and ensure all required fields
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || '',
          role: user.role || 'user',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          teamRole: user.teamRole || 'member',
          status: user.status || 'active',
        } as ExtendedUser;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.teamRole = user.teamRole;
        token.status = user.status;
      } else if (trigger === "update" && session) {
        // Handle session updates
        return { ...token, ...session.user };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Map all token data to session
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
          firstName: token.firstName,
          lastName: token.lastName,
          teamRole: token.teamRole,
          status: token.status,
        };
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 