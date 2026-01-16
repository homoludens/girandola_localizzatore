import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Base auth configuration (used by middleware - no database adapter)
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.includes("/dashboard");
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login page
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      // On initial sign in, persist the user ID from the database
      if (user) {
        token.userId = user.id;
      }
      // Handle account linking if needed
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Add userId to session for linking Girandolas to the specific DB record
      if (token && session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
};
