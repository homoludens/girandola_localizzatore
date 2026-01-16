# Girandola Localizzatore - Developer Documentation

## Project Overview

Girandola Localizzatore is a mobile-first location tracking application where users can log in, view a map, add points of interest called "Girandolas" (Pinwheels), and export the data.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | App Router framework |
| Tailwind CSS | Styling (with shadcn/ui components) |
| Vercel KV | Redis-based storage |
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
├── i18n/
│   ├── config.ts           # Locale configuration
│   ├── navigation.ts       # Localized Link/useRouter
│   ├── request.ts          # Server-side i18n
│   └── routing.ts          # Routing configuration
└── middleware.ts           # Combined i18n + auth middleware
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
AUTH_SECRET=your_random_secret

# Optional: Explicitly set the auth URL
NEXTAUTH_URL=http://localhost:3000
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

## Upcoming Tasks

- **Task 4**: Vercel KV database setup
- **Task 5**: Add Girandola functionality (GPS + manual placement)
- **Task 6**: Export to CSV feature
