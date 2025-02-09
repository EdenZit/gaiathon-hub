import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        try {
          await connectDB();

          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          if (!user) {
            throw new Error('Invalid email or password');
          }

          const isValid = await user.comparePassword(credentials.password);
          if (!isValid) {
            throw new Error('Invalid email or password');
          }

          const userObject = user.toObject();
          return {
            id: userObject._id.toString(),
            email: userObject.email,
            name: userObject.name,
            firstName: userObject.firstName,
            lastName: userObject.lastName,
            role: userObject.role,
            status: userObject.status,
            teamRole: userObject.teamRole,
            teams: userObject.teams,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.status = user.status;
        token.teamRole = user.teamRole;
        token.teams = user.teams;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.teamRole = token.teamRole;
        session.user.teams = token.teams;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST }; 