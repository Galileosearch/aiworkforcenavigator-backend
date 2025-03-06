import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add more providers as needed
  ],
  // Optional: Add additional configuration
  callbacks: {
    async session({ session, token }) {
      // Add custom fields to session if needed
      session.user.id = token.sub;
      return session;
    },
  },
  // Add error handling, pages, etc.
  pages: {
    signIn: '/auth/signin',
    // error: '/auth/error',
  },
};