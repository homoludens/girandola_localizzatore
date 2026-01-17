import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./config";

// Full auth handler with Prisma adapter for database storage
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account, profile }) {
      // For native Google sign-in (credentials provider), find or create user in DB
      if (user && account?.provider === "google-native") {
        // Look up user by email
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // If user doesn't exist, create them
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: new Date(), // Native Google auth verifies email
            },
          });

          // Create an account record for the native Google provider
          await prisma.account.create({
            data: {
              userId: dbUser.id,
              type: "credentials",
              provider: "google-native",
              providerAccountId: user.id!, // Google's user ID
            },
          });
        }

        // Use the database user ID for the token
        token.userId = dbUser.id;
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.picture = dbUser.image;
      } else if (user) {
        // For regular Google OAuth, use the user ID from the adapter
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
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
});
