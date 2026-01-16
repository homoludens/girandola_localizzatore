# **Phase 2: Migration from Vercel KV to Neon Postgres**

Use these prompts to refactor your existing "Girandola Localizzatore" application.

## **📝 Task 8: Database Migration (Setup Prisma & Neon)**

**Prompt:** I am migrating my data storage from Vercel KV to Neon Postgres.

1. Install `prisma`, `@prisma/client`, and `@neondatabase/serverless`.  
2. Initialize Prisma in the project.  
3. Create a `prisma/schema.prisma` file with the following models:  
   * **User, Account, Session, VerificationToken** (Standard models required for the NextAuth Prisma Adapter).  
   * **Girandola**: `id` (String/UUID), `lat` (Float), `lng` (Float), `createdAt` (DateTime), and a relation `user` linking to the `User` model via `userId`.  
4. Update the `.env.local` file to use `DATABASE_URL` (Neon connection string) instead of KV variables.  
5. Provide the command to push this schema to Neon.

## **📝 Task 9: Refactoring Authentication (Prisma Adapter)**

**Prompt:** Now that we have Postgres, I want NextAuth to store users in the database rather than just using JWT.

1. Install `@auth/prisma-adapter`.  
2. Modify the `app/api/auth/[...nextauth]/route.ts` (or your config file) to include the `PrismaAdapter`.  
3. Ensure the session strategy is set to `"database"` or keep `"jwt"` if preferred, but ensure the `userId` is available in the session callback so we can link Girandolas to the specific DB record.  
4. Update the Navbar to ensure it still correctly displays user info from the new session structure.

## **📝 Task 10: Refactoring Data Persistence (KV to Prisma)**

**Prompt:** I need to replace the Vercel KV logic with Prisma logic in my API/Server Actions.

1. Locate the logic where we currently save a "Girandola" (previously `kv.set` or `kv.lpush`).  
2. Rewrite this using `prisma.girandola.create`. Ensure we use the `userId` from the authenticated session.  
3. Locate the logic where we fetch "Girandolas" (previously `kv.get` or `kv.lrange`).  
4. Rewrite this using `prisma.girandola.findMany`.  
5. Ensure the coordinates are handled as Floats/Numbers to maintain precision in Postgres.

## **📝 Task 11: Updating the Export Feature**

**Prompt:** Update the "Export CSV" functionality to work with Postgres.

1. Update the export function to query the `Girandola` table using Prisma.  
2. Filter the query so users can only export Girandolas where `userId` matches their own ID.  
3. Order the results by `createdAt` descending.  
4. Keep the CSV formatting logic the same, but ensure it handles the Date object from Postgres correctly.

## **📝 Task 12: Cleanup & Optimization**

**Prompt:** Final cleanup of the migration.

1. Uninstall the `@vercel/kv` package as it is no longer needed.  
2. Add a global Prisma client singleton in `lib/prisma.ts` to prevent "too many clients" errors in Next.js hot reloading.  
3. Verify that the map markers still load correctly from the new Postgres source.  
4. Check that the "Add Girandola" flow still works end-to-end.

