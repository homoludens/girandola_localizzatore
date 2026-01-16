# Girandola Localizzatore - Developer Documentation

## Project Overview

Girandola Localizzatore is a mobile-first location tracking application where users can log in, view a map, add points of interest called "Girandolas" (Pinwheels), and export the data.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | App Router framework |
| Tailwind CSS | Styling (with shadcn/ui components) |
| Neon Postgres | Serverless PostgreSQL database |
| Prisma ORM | Database access and schema management |
| NextAuth.js v5 | Authentication (Google OAuth) |
| react-leaflet | OpenStreetMap integration |
| next-intl | Internationalization (en/it) |

## Project Structure

```
src/
├── app/
│   ├── [locale]/           # Localized routes (en, it)
│   │   ├── layout.tsx      # Root layout with i18n provider
│   │   ├── page.tsx        # Home page
│   │   ├── login/          # Login page
│   │   │   └── page.tsx
│   │   └── dashboard/      # Protected dashboard
│   │       └── page.tsx
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts  # NextAuth API handler
├── auth/
│   ├── config.ts           # NextAuth configuration
│   └── index.ts            # Auth exports
├── components/
│   ├── LanguageSwitcher.tsx
│   ├── Navigation.tsx      # Main nav bar (server component)
│   ├── UserMenu.tsx        # User dropdown (client component)
│   └── map/
│       ├── index.tsx       # Dynamic import wrapper (ssr: false)
│       └── MapComponent.tsx # Leaflet map component
├── generated/prisma/       # Generated Prisma client (gitignored)
├── i18n/
│   ├── config.ts           # Locale configuration
│   ├── navigation.ts       # Localized Link/useRouter
│   ├── request.ts          # Server-side i18n
│   └── routing.ts          # Routing configuration
├── lib/
│   └── prisma.ts           # Prisma client singleton with Neon config
└── middleware.ts           # Combined i18n + auth middleware
prisma/
└── schema.prisma           # Database schema (User, Account, Session, Girandola)
prisma.config.ts            # Prisma configuration
messages/
├── en.json                 # English translations
└── it.json                 # Italian translations
```

## Implementation Progress

### Task 1: Project Scaffolding & i18n Setup ✅

- Initialized Next.js 15 with App Router
- Configured Tailwind CSS
- Set up next-intl for internationalization
- Created locale-based routing (`/en/...`, `/it/...`)
- Implemented language switcher component
- Auto-detects browser language preference

### Task 2: Authentication (NextAuth) ✅

**What was implemented:**

1. **NextAuth v5 (Auth.js)** - Installed `next-auth@beta` for the latest version compatible with Next.js 15.

2. **Google OAuth Provider** - Configured in `src/auth/config.ts`:
   ```typescript
   providers: [
     Google({
       clientId: process.env.GOOGLE_CLIENT_ID!,
       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
     }),
   ]
   ```

3. **API Route Handler** - Created at `src/app/api/auth/[...nextauth]/route.ts` to handle all auth endpoints (`/api/auth/signin`, `/api/auth/signout`, etc.)

4. **Login Page** - Mobile-first design at `/[locale]/login`:
   - Redirects authenticated users to home
   - Google sign-in button with official branding
   - Full i18n support

5. **Protected Routes** - Middleware combines next-intl with NextAuth:
   - `/dashboard` requires authentication
   - Unauthenticated users redirected to `/login`
   - Preserves locale in redirects

6. **User Menu Component** - Displays in navigation when logged in:
   - User avatar (from Google profile or initials fallback)
   - User name and email
   - Sign out button
   - Click-outside-to-close behavior

7. **Navigation Updates**:
   - Shows "Dashboard" link when authenticated
   - Shows user menu when authenticated
   - Shows "Login" button when not authenticated

## Environment Variables

Required in `.env.local`:

```bash
# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# NextAuth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_random_secret

# Auth URL
NEXTAUTH_URL=http://localhost:3000

# Neon Postgres Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.vercel.app/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret

## Running the Project

```bash
# Install dependencies
npm install

# Setup database (first time only)
npx prisma db push
npx prisma generate

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Task 3: Map Component (Leaflet) ✅

**What was implemented:**

1. **Leaflet Packages** - Installed `react-leaflet`, `leaflet`, and `@types/leaflet` for TypeScript support.

2. **MapComponent** (`src/components/map/MapComponent.tsx`):
   - Renders OpenStreetMap tiles via `TileLayer`
   - Configurable props: `center`, `zoom`, `className`
   - Default center: Turin, Italy (45.0703, 7.6869)
   - Includes `MapResizeHandler` to properly handle container resize events
   - Full-width and full-height within container

3. **SSR Handling** (`src/components/map/index.tsx`):
   - Uses `next/dynamic` with `{ ssr: false }` to prevent hydration errors
   - Leaflet requires `window`/`document` which aren't available during SSR
   - Shows loading spinner while map loads client-side

4. **Leaflet Icon Fix**:
   - Default marker icons don't bundle correctly in Webpack/Next.js
   - Configured CDN fallback for marker assets:
     ```typescript
     L.Icon.Default.mergeOptions({
       iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
       iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
       shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
     });
     ```

5. **Dashboard Integration**:
   - Map takes full remaining screen height: `h-[calc(100vh-57px)]`
   - Accounts for navigation bar height

6. **i18n Translations** - Added `map` namespace with loading states in both `en.json` and `it.json`.

**Usage:**
```tsx
import { MapComponent } from "@/components/map";

// Basic usage
<MapComponent />

// With custom center and zoom
<MapComponent center={[45.0703, 7.6869]} zoom={15} />
```

### Task 8: Database Migration - Prisma & Neon ✅

**What was implemented:**

1. **Installed packages:**
   - `@prisma/client` - Prisma ORM client
   - `@neondatabase/serverless` - Neon serverless adapter for edge functions
   - `prisma` (devDependency) - Prisma CLI
   - `dotenv` (devDependency) - Environment variable loading

2. **Prisma Schema** (`prisma/schema.prisma`):
   ```prisma
   // NextAuth.js required models
   model User {
     id            String      @id @default(cuid())
     name          String?
     email         String?     @unique
     emailVerified DateTime?
     image         String?
     accounts      Account[]
     sessions      Session[]
     girandolas    Girandola[]
     createdAt     DateTime    @default(now())
     updatedAt     DateTime    @updatedAt
   }

   model Account {
     id                String  @id @default(cuid())
     userId            String
     type              String
     provider          String
     providerAccountId String
     refresh_token     String? @db.Text
     access_token      String? @db.Text
     expires_at        Int?
     token_type        String?
     scope             String?
     id_token          String? @db.Text
     session_state     String?
     user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
     @@unique([provider, providerAccountId])
   }

   model Session {
     id           String   @id @default(cuid())
     sessionToken String   @unique
     userId       String
     expires      DateTime
     user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
   }

   model VerificationToken {
     identifier String
     token      String   @unique
     expires    DateTime
     @@unique([identifier, token])
   }

   model Girandola {
     id        String   @id @default(uuid())
     lat       Float
     lng       Float
     createdAt DateTime @default(now())
     userId    String
     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     @@index([userId])
   }
   ```

3. **Prisma Client Singleton** (`src/lib/prisma.ts`):
   - Prevents multiple Prisma instances in development
   - Configured with Neon serverless connection pooling
   - Logging enabled in development mode

4. **Prisma Configuration** (`prisma.config.ts`):
   - Loads environment variables from `.env.local` and `.env`
   - Points to schema file location

**Database Commands:**
```bash
# Push schema changes to database
npx prisma db push

# Generate Prisma client after schema changes
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Create a migration (for production)
npx prisma migrate dev --name migration_name
```

**Usage in code:**
```typescript
import { prisma } from "@/lib/prisma";

// Create a Girandola
const girandola = await prisma.girandola.create({
  data: {
    lat: 45.0703,
    lng: 7.6869,
    userId: user.id,
  },
});

// Get all Girandolas for a user
const girandolas = await prisma.girandola.findMany({
  where: { userId: user.id },
});
```

### Task 9: Authentication Refactoring (Prisma Adapter) ✅

**What was implemented:**

1. **Prisma Adapter for NextAuth** - Installed `@auth/prisma-adapter` to store users, accounts, and sessions in the database.

2. **Updated Auth Configuration** (`src/auth/index.ts`):
   ```typescript
   import { PrismaAdapter } from "@auth/prisma-adapter";
   import { prisma } from "@/lib/prisma";
   
   export const { handlers, auth, signIn, signOut } = NextAuth({
     ...authConfig,
     adapter: PrismaAdapter(prisma),
   });
   ```

3. **JWT Session with User ID** - Added callbacks to persist `userId` in JWT and session:
   ```typescript
   callbacks: {
     async jwt({ token, user }) {
       if (user) token.userId = user.id;
       return token;
     },
     async session({ session, token }) {
       if (token) session.user.id = token.userId as string;
       return session;
     },
   }
   ```

4. **Type Extensions** (`src/types/next-auth.d.ts`):
   - Extended `Session` interface to include `user.id`
   - Extended `JWT` interface to include `userId`

### Task 10: Data Persistence Refactoring (KV to Prisma) ✅

**What was implemented:**

1. **Removed Vercel KV** - All `@vercel/kv` imports and usage removed from source code.

2. **Girandola API** (`src/app/api/girandolas/route.ts`):
   - `GET` - Fetches all Girandolas with user email via Prisma
   - `POST` - Creates new Girandola linked to authenticated user's `userId`

3. **Prisma Queries:**
   ```typescript
   // Create
   await prisma.girandola.create({
     data: { lat, lng, userId: session.user.id },
   });
   
   // Read all
   await prisma.girandola.findMany({
     include: { user: { select: { email: true } } },
     orderBy: { createdAt: "desc" },
   });
   ```

4. **Coordinate Precision** - `lat` and `lng` stored as `Float` (PostgreSQL double precision) for full floating-point accuracy.

### Task 11: Export Feature Update ✅

**What was implemented:**

1. **New Export Endpoint** (`src/app/api/girandolas/export/route.ts`):
   - Requires authentication (returns 401 if not logged in)
   - Filters by `userId` - users can only export their own Girandolas
   - Orders by `createdAt` descending
   - Converts Postgres `DateTime` to ISO string for CSV compatibility

2. **Prisma Query for Export:**
   ```typescript
   await prisma.girandola.findMany({
     where: { userId: session.user.id },
     include: { user: { select: { email: true } } },
     orderBy: { createdAt: "desc" },
   });
   ```

3. **Updated DashboardClient** - Export button now calls `/api/girandolas/export` instead of `/api/girandolas`.

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/[...nextauth]` | * | - | NextAuth handlers |
| `/api/girandolas` | GET | No | Get all Girandolas |
| `/api/girandolas` | POST | Yes | Create new Girandola |
| `/api/girandolas/export` | GET | Yes | Get user's own Girandolas (for CSV)
