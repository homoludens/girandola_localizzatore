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
| next-intl | Internationalization (en/it, default: Italian) |
| Capacitor | Android app wrapper (WebView) |

## Project Structure

```
src/
├── app/
│   ├── [locale]/           # Localized routes (en, it)
│   │   ├── layout.tsx      # Root layout with i18n provider
│   │   ├── page.tsx        # Home page (map, protected)
│   │   ├── login/          # Login page
│   │   │   └── page.tsx
│   │   └── contributors/   # Top contributors page
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts  # NextAuth API handler
│   │   ├── girandolas/
│   │   │   ├── route.ts      # GET all, POST new
│   │   │   └── export/
│   │   │       └── route.ts  # GET user's own (for CSV)
│   │   └── contributors/
│   │       └── route.ts      # GET top contributors
│   ├── icon.png            # Favicon (girandola image)
│   ├── apple-icon.png      # Apple touch icon
│   ├── favicon.ico         # Favicon
│   └── manifest.json       # Web app manifest
├── auth/
│   ├── config.ts           # NextAuth configuration
│   └── index.ts            # Auth exports
├── components/
│   ├── LanguageSwitcher.tsx  # Language dropdown (visible on mobile)
│   ├── Navigation.tsx      # Main nav bar with logo (z-[1000] for map overlay)
│   ├── UserMenu.tsx        # User dropdown (client component)
│   ├── DashboardClient.tsx # Main map interface with GPS/pick modes
│   ├── AddGirandolaDialog.tsx # Modal for adding girandolas
│   └── map/
│       ├── index.tsx       # Dynamic import wrapper (ssr: false)
│       └── MapComponent.tsx # Leaflet map (default: Arvier, Italy)
├── generated/prisma/       # Generated Prisma client (gitignored)
├── i18n/
│   ├── config.ts           # Locale configuration (default: it)
│   ├── navigation.ts       # Localized Link/useRouter
│   ├── request.ts          # Server-side i18n
│   └── routing.ts          # Routing configuration
├── lib/
│   └── prisma.ts           # Prisma client singleton with Neon config
└── middleware.ts           # Combined i18n + auth middleware (protects /)
public/
├── girandola.png           # Logo image
├── web-app-manifest-192x192.png  # PWA icon
└── web-app-manifest-512x512.png  # PWA icon
prisma/
└── schema.prisma           # Database schema (User, Account, Session, Girandola)
prisma.config.ts            # Prisma configuration
messages/
├── en.json                 # English translations
└── it.json                 # Italian translations
android/                    # Capacitor Android project (gitignored)
capacitor.config.ts         # Capacitor configuration
```

## Implementation Progress

### Task 1: Project Scaffolding & i18n Setup ✅

- Initialized Next.js 15 with App Router
- Configured Tailwind CSS
- Set up next-intl for internationalization
- Created locale-based routing (`/en/...`, `/it/...`)
- **Default language: Italian** (`src/i18n/config.ts`)
- Implemented language switcher component (visible on mobile and desktop)
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
   - **Girandola logo displayed above login form**
   - Full i18n support

5. **Protected Routes** - Middleware combines next-intl with NextAuth:
   - **Home page (`/`) requires authentication**
   - Unauthenticated users redirected to `/login`
   - Preserves locale in redirects

6. **User Menu Component** - Displays in navigation when logged in:
   - User avatar (from Google profile or initials fallback)
   - User name and email
   - Sign out button
   - Click-outside-to-close behavior

7. **Navigation Updates**:
   - **Logo with girandola image** (text hidden on mobile)
   - **Link to Top Contributors page**
   - Shows user menu when authenticated
   - Shows "Login" button when not authenticated
   - **z-[1000] to stay above Leaflet map**

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
   - **Default center: Arvier, Valle d'Aosta, Italy (45.7024, 7.1665)**
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

5. **Home Page Integration**:
   - **Map is now the home page** (previously dashboard)
   - Map takes full remaining screen height: `h-[calc(100vh-57px)]`
   - Accounts for navigation bar height

6. **i18n Translations** - Added `map` namespace with loading states in both `en.json` and `it.json`.

**Usage:**
```tsx
import { MapComponent } from "@/components/map";

// Basic usage (defaults to Arvier)
<MapComponent />

// With custom center and zoom
<MapComponent center={[45.7024, 7.1665]} zoom={15} />
```

### Task 4: Add Girandola with GPS ✅

**What was implemented:**

1. **GPS Location Flow**:
   - User clicks "Add Girandola" button
   - Selects "Use My GPS" option
   - **Map centers on GPS position before saving**
   - User sees marker at their location
   - User confirms or cancels the placement
   - Girandola is saved only after confirmation

2. **Pick on Map Flow**:
   - User clicks "Add Girandola" button
   - Selects "Pick on Map" option
   - Map enters pick mode (crosshair cursor)
   - User taps location on map
   - Confirm bar appears with Cancel/Confirm buttons

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

### Task 12: Top Contributors Page ✅

**What was implemented:**

1. **Contributors API** (`src/app/api/contributors/route.ts`):
   - Returns top 20 users ranked by girandola count
   - Includes user id, name, image, and count
   - No authentication required

2. **Contributors Page** (`src/app/[locale]/contributors/page.tsx`):
   - Displays ranked list of contributors
   - **Gold star icon for 1st place**
   - **Silver star icon for 2nd place**
   - **Bronze star icon for 3rd place**
   - Numbers for ranks 4+
   - User avatar and name
   - Girandola count
   - Subtle gradient background for top 3

3. **Translations** - Added `contributors` namespace in both `en.json` and `it.json`

4. **Navigation Link** - "Top Contributors" / "Top Contributori" link in navbar

### Task 13: Favicon & Branding ✅

**What was implemented:**

1. **Girandola Logo** - Custom pinwheel/sprinkler image used throughout:
   - `src/app/icon.png` - Main favicon
   - `src/app/apple-icon.png` - Apple touch icon
   - `src/app/favicon.ico` - ICO favicon
   - `public/girandola.png` - Logo for navigation and login
   - `public/web-app-manifest-192x192.png` - PWA icon
   - `public/web-app-manifest-512x512.png` - PWA icon

2. **Navigation Logo** - Girandola image in top-left with app name (name hidden on mobile)

3. **Login Page Logo** - Large girandola image above login form

4. **PWA Manifest** - `src/app/manifest.json` for web app installation

5. **Apple Web App Title** - Configured via Next.js Metadata

### Task 14: Capacitor Android App Setup ✅

**What was implemented:**

1. **Installed Capacitor packages:**
   - `@capacitor/core` - Core Capacitor runtime
   - `@capacitor/cli` - CLI tools for building and syncing
   - `@capacitor/android` - Android platform support
   - `@capgo/capacitor-social-login` - Native Google Sign-In support

2. **Capacitor Configuration** (`capacitor.config.ts`):
   ```typescript
   import type { CapacitorConfig } from '@capacitor/cli';

   const config: CapacitorConfig = {
     appId: 'net.droopia.girandola',
     appName: 'Girandola Localizzatore',
     webDir: 'out',
     server: {
       url: 'https://girandola-localizzatore.vercel.app',
       cleartext: true,
     },
     plugins: {
       SocialLogin: {
         providers: {
           google: true,
           facebook: false,
           apple: false,
           twitter: false,
         },
       },
     },
   };

   export default config;
   ```

3. **Next.js Configuration** (`next.config.ts`):
   - Added conditional `output: 'export'` for Capacitor builds
   - Set via `CAPACITOR_BUILD=true` environment variable
   - Normal Vercel builds remain unchanged (server-side features work)

4. **Package Scripts** (`package.json`):
   ```json
   "static-build": "next build && npx cap copy"
   ```

5. **Android Platform** - Added via `npx cap add android`
   - Creates `android/` directory with native project
   - Ready to open in Android Studio

**Important: WebView Approach**

Since this app uses API routes, authentication, and database operations, the recommended approach is to use Capacitor's WebView to load the Vercel-hosted app:

1. Deploy to Vercel as usual
2. Set the `server.url` in `capacitor.config.ts` to your Vercel URL
3. The Android app will load the web app in a native WebView

This ensures all features work (login, API calls, database) without code changes.

**Android Development Commands:**
```bash
# Build for Android (creates static files)
CAPACITOR_BUILD=true npm run build

# Copy web assets to Android
npx cap copy android

# Open in Android Studio
npx cap open android

# Sync plugins and dependencies
npx cap sync android
```

**Native Google Sign-In for Android:**

The app uses `@capgo/capacitor-social-login` for native Google authentication. Setup requires:

1. **Get SHA-1 Fingerprint:**
   ```bash
   cd android && ./gradlew signingReport
   ```

2. **Create Android OAuth Client in Google Cloud Console:**
   - Type: Android
   - Package name: `net.droopia.girandola`
   - SHA-1: From step 1

3. **Configure Web Client ID in `strings.xml`:**
   ```xml
   <string name="server_client_id">YOUR_WEB_CLIENT_ID.apps.googleusercontent.com</string>
   ```

See `docs/deploy.md` for detailed instructions.

**Project Structure Addition:**
```
android/                    # Capacitor Android project
├── app/
│   └── src/main/
│       ├── assets/public/  # Web assets copied here
│       └── AndroidManifest.xml
├── build.gradle
└── settings.gradle
capacitor.config.ts         # Capacitor configuration
```

### Task 15: Native Auth Integration with NextAuth ✅

**What was implemented:**

1. **useNativeAuth Hook** (`src/hooks/useNativeAuth.ts`):
   - Detects if running on native platform via `Capacitor.isNativePlatform()`
   - Initializes the SocialLogin plugin on native platforms
   - Provides `nativeSignIn()` function that triggers native Google Sign-In
   - Returns the ID token to authenticate with NextAuth

2. **Credentials Provider for Native Auth** (`src/auth/config.ts`):
   - Added `google-native` credentials provider
   - Validates Google ID tokens via Google's OAuth2 API
   - Returns user data (id, email, name, image) from the token

3. **User Creation for Native Auth** (`src/auth/index.ts`):
   - On native sign-in, finds or creates user in Postgres database
   - Creates an account record linking the Google ID to the user
   - Returns database user ID in JWT for session persistence

4. **LoginButton Component** (`src/components/LoginButton.tsx`):
   - Client component that uses `useNativeAuth` hook
   - On native: triggers `SocialLogin.login()` then `signIn("google-native")`
   - On web: triggers regular `signIn("google")` OAuth flow
   - Shows loading states and error messages

5. **Updated Login Page** (`src/app/[locale]/login/page.tsx`):
   - Now uses the client-side `LoginButton` component
   - Works seamlessly on both web and Android

**Flow:**
```
Android User clicks "Sign in with Google"
    → useNativeAuth detects native platform
    → SocialLogin.login() shows native account picker
    → User selects Google account
    → Returns { provider: 'google', result: { idToken, profile, ... } }
    → idToken extracted from result.idToken (not top-level)
    → signIn("google-native", {idToken}) called
    → NextAuth validates token with Google API
    → User found/created in Postgres
    → JWT session created
    → User redirected to home page
```

**Important:** The `@capgo/capacitor-social-login` plugin returns a wrapped response structure:
```typescript
{
  provider: 'google',
  result: {
    idToken: string | null,
    accessToken: { token: string } | null,
    profile: { email, name, ... },
    responseType: 'online'
  }
}
```
The `idToken` must be accessed via `response.result.idToken`, not `response.idToken`.

**Environment Variables:**
```bash
# Required for native auth (add to Vercel)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_web_client_id
```

### Task 16: Optimizing Map & GPS for Android ✅

**What was implemented:**

1. **Installed `@capacitor/geolocation`** - Native Capacitor plugin for GPS functionality on Android.

2. **useNativeGeolocation Hook** (`src/hooks/useNativeGeolocation.ts`):
   - Detects if running on native platform via `Capacitor.isNativePlatform()`
   - Uses Capacitor Geolocation plugin on Android with proper permission handling
   - Falls back to browser `navigator.geolocation` API on web
   - Handles permission checking and requesting via native Android dialogs

3. **Updated DashboardClient** (`src/components/DashboardClient.tsx`):
   - Now uses `useNativeGeolocation` hook for GPS functionality
   - "Use My GPS" button triggers native permission prompt on Android
   - Same codebase works on both Vercel (web) and Android

4. **Android Permissions** (`android/app/src/main/AndroidManifest.xml`):
   - Added `ACCESS_COARSE_LOCATION` permission
   - Added `ACCESS_FINE_LOCATION` permission for precise GPS
   - Declared `android.hardware.location.gps` feature

**Flow:**
```
User taps "Add Girandola" → "Use My GPS"
    → useNativeGeolocation detects platform
    → Android: Capacitor Geolocation checks permissions
    → If not granted: Native Android permission dialog appears
    → User grants permission
    → GPS position retrieved with high accuracy
    → Map centers on user location
    → User confirms to save girandola
```

**Key Files:**
| File | Purpose |
|------|---------|
| `src/hooks/useNativeGeolocation.ts` | Hook for native/web geolocation |
| `src/components/DashboardClient.tsx` | Uses hook for GPS feature |
| `android/app/src/main/AndroidManifest.xml` | Location permissions |

### Task 17: Terms of Service & Privacy Policy Pages ✅

**What was implemented:**

1. **Created Terms of Service Page** (`src/app/[locale]/terms/page.tsx`):
   - Comprehensive 10-section terms covering service usage, user accounts, location data, and liability
   - Client-side rendered with full i18n support
   - Clean, readable layout with proper typography

2. **Created Privacy Policy Page** (`src/app/[locale]/privacy/page.tsx`):
   - Detailed 10-section privacy policy explaining data collection, storage, and user rights
   - Covers Google OAuth, GPS data, cookies, and third-party services
   - Explains Android location permissions
   - Client-side rendered with full i18n support

3. **Added Translations** (`messages/en.json` and `messages/it.json`):
   - Complete English and Italian translations for both legal pages
   - Includes all section titles and content
   - Added `legal` namespace for navigation links

4. **Updated Navigation** (`src/components/Navigation.tsx`):
   - Added "Terms of Service" and "Privacy Policy" links to desktop navigation
   - Links visible to all users (not authentication-gated)

5. **Updated Mobile Menu** (`src/components/MobileMenu.tsx`):
   - Added legal links section with visual divider
   - Document and shield icons for terms and privacy respectively
   - Active state highlighting for current page

**Pages:**
- `/[locale]/terms` - Terms of Service (accessible in all languages)
- `/[locale]/privacy` - Privacy Policy (accessible in all languages)

**Key Topics Covered:**
- **Terms of Service**: Acceptance, service description, user accounts, location data usage, prohibited conduct, warranties, liability
- **Privacy Policy**: Data collection (Google OAuth, GPS), data usage, information sharing, storage (Neon Postgres), third-party services, user rights, Android permissions, cookies

### Task 18: GPS Accuracy Display & Threshold ✅

**What was implemented:**

1. **GPS Accuracy Display** - When using "Use My GPS" to add a Girandola, the accuracy is now displayed:
   - Shows accuracy in meters (e.g., "GPS accuracy: 5m")
   - Green color when accuracy is 10m or better
   - Red color when accuracy is worse than 10m

2. **10m Accuracy Threshold** - The Confirm button is disabled when GPS accuracy exceeds 10 meters:
   - Prevents users from adding imprecise locations
   - Shows message "(must be under 10m)" when accuracy is too low
   - Users can cancel and retry to get better GPS signal

3. **Updated Translations** - Added new translation keys in both English and Italian:
   - `addGirandola.accuracy` - "GPS accuracy" / "Precisione GPS"
   - `addGirandola.accuracyTooLow` - "must be under 10m" / "deve essere sotto 10m"

**Key Files:**
| File | Purpose |
|------|---------|
| `src/components/DashboardClient.tsx` | GPS accuracy state, display, and threshold check |
| `messages/en.json` | English translations for accuracy messages |
| `messages/it.json` | Italian translations for accuracy messages |

**Flow:**
```
User taps "Add Girandola" → "Use My GPS"
    → GPS position retrieved with accuracy
    → If accuracy ≤ 10m: Green indicator, Confirm enabled
    → If accuracy > 10m: Red indicator, Confirm disabled
    → User can retry or pick on map instead
```

### Task 19: Bottom Status Bar with GPS Controls ✅

**What was implemented:**

1. **Bottom Status Bar** - Replaced floating buttons with a fixed status bar at the bottom:
   - Clean, non-overlapping UI below the map
   - Contains: Location button (left), GPS status (center), Add marker button (right)
   - 56px height, white background with top border

2. **GPS Status Display** - Shows current GPS position in the center:
   - Displays shortened lat/lng coordinates (4 decimal places)
   - Shows accuracy with color coding (green ≤10m, orange >10m)
   - Shows "Tap location to get GPS" when no GPS data yet

3. **Location Button** - Left side of status bar:
   - Blue location pin icon
   - Shows spinner while getting GPS position
   - Centers map on user's location with smooth flyTo animation

4. **Add Marker Button** - Right side of status bar:
   - Blue circular button with plus icon
   - Opens the "Add Girandola" dialog

5. **Map Component Enhancement** - Added `FlyToLocation` component and `focusLocation` prop:
   - Separate from `pendingLocation` (which is used for adding markers)
   - Uses Leaflet's `flyTo` for smooth animated transition
   - Zooms to level 16 for detailed street view

6. **Updated Translations** - Added new translation keys:
   - `map.locateMe` - "Show my location" / "Mostra la mia posizione"
   - `map.noGpsData` - "Tap location to get GPS" / "Tocca posizione per GPS"

**Key Files:**
| File | Purpose |
|------|---------|
| `src/components/DashboardClient.tsx` | Status bar UI with all controls |
| `src/components/map/MapComponent.tsx` | `FlyToLocation` component and `focusLocation` prop |
| `messages/en.json` | English translations |
| `messages/it.json` | Italian translations |

**Status Bar Layout:**
```
┌─────────────────────────────────────────────────┐
│  [📍]     45.7024, 7.1665  ±5m        [+]      │
│  locate   GPS coordinates/accuracy    add      │
└─────────────────────────────────────────────────┘
```

**Flow:**
```
User taps location button
    → Button shows loading spinner
    → GPS position retrieved
    → Map smoothly flies to user's location
    → Status bar shows coordinates and accuracy
    → User can see what's on the map at their location
    → User can then tap "+" to add a Girandola
```

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/[...nextauth]` | * | - | NextAuth handlers |
| `/api/girandolas` | GET | No | Get all Girandolas |
| `/api/girandolas` | POST | Yes | Create new Girandola |
| `/api/girandolas/export` | GET | Yes | Get user's own Girandolas (for CSV) |
| `/api/contributors` | GET | No | Get top 20 contributors |
