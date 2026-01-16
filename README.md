# Girandola Localizzatore

A mobile-first location tracking application where users can log in, view a map, add points of interest called "Girandolas" (Pinwheels), and export the data.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Hosting:** Optimized for Vercel Free Tier
- **Styling:** Tailwind CSS
- **Database:** Vercel KV (Redis)
- **Authentication:** NextAuth.js (Auth.js) with Google Provider
- **Maps:** react-leaflet (OpenStreetMap) - no API key required
- **Internationalization:** next-intl (English & Italian)

## Features

- Auto-detect browser language with manual toggle
- Full-screen map showing existing Girandolas
- Add location via GPS or manual map placement
- Export all points as CSV file
- Mobile-first responsive design

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# NextAuth.js
AUTH_SECRET=your-auth-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Vercel KV (automatically set when linking KV database on Vercel)
KV_URL=your-kv-url
KV_REST_API_URL=your-kv-rest-api-url
KV_REST_API_TOKEN=your-kv-rest-api-token
KV_REST_API_READ_ONLY_TOKEN=your-kv-read-only-token
```

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Create an OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.vercel.app/api/auth/callback/google` (production)

### Setting up Vercel KV

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to "Storage" tab
4. Create a new KV database
5. Environment variables will be automatically added to your project

## Development

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

## Deployment

### Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in [Vercel](https://vercel.com/new)
3. Add the required environment variables
4. Link a Vercel KV database from the Storage tab
5. Deploy

The app will automatically deploy on every push to the main branch.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth API route
│   │   └── girandolas/          # Girandola CRUD endpoints
│   └── [locale]/                # Localized pages
├── auth/                        # NextAuth configuration
├── components/                  # React components
│   └── map/                     # Map components
├── i18n/                        # Internationalization config
└── types/                       # TypeScript types
messages/                        # Translation files (en.json, it.json)
```

## License

MIT
