import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Base auth configuration (used by middleware - no database adapter)
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials provider for native Android Google Sign-In
    Credentials({
      id: "google-native",
      name: "Google Native",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        const idToken = credentials?.idToken as string | undefined;
        
        if (!idToken) {
          return null;
        }

        try {
          // Verify the Google ID token
          const response = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
          );

          if (!response.ok) {
            console.error("Invalid Google ID token");
            return null;
          }

          const payload = await response.json();

          // Verify the token was issued for our app
          const clientId = process.env.GOOGLE_CLIENT_ID;
          if (payload.aud !== clientId) {
            console.error("Token audience mismatch");
            return null;
          }

          // Return user data from the token
          return {
            id: payload.sub, // Google's user ID
            email: payload.email,
            name: payload.name,
            image: payload.picture,
          };
        } catch (error) {
          console.error("Error verifying Google ID token:", error);
          return null;
        }
      },
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
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
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
