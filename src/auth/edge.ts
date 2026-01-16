import NextAuth from "next-auth";
import { authConfig } from "./config";

// Edge-compatible auth (no Prisma adapter for middleware use)
export const { auth } = NextAuth(authConfig);
