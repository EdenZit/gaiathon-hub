import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models/User';

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

        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('No user found with this email');
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          name: `${user.firstName} ${user.lastName}`,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.firstName = token.firstName;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST }; 