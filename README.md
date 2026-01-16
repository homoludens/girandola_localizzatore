# Girandola Localizzatore

A mobile-first location tracking application where users can log in, view a map, add points of interest called "Girandolas" (Pinwheels), and export the data.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Hosting:** Optimized for Vercel Free Tier
- **Styling:** Tailwind CSS
- **Database:** Neon Postgres with Prisma ORM
- **Authentication:** NextAuth.js (Auth.js) with Google Provider + Prisma Adapter
- **Maps:** react-leaflet (OpenStreetMap) - no API key required
- **Internationalization:** next-intl (English & Italian)

## Features

- Auto-detect browser language with manual toggle
- Full-screen map showing existing Girandolas
- Add location via GPS or manual map placement
- Export your own Girandolas as CSV file (filtered by user)
- Mobile-first responsive design

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# NextAuth.js
NEXTAUTH_SECRET=your-auth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Neon Postgres Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Create an OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.vercel.app/api/auth/callback/google` (production)

### Setting up Neon Postgres

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string from the dashboard
4. Add it to your `.env.local` as `DATABASE_URL`
5. Run `npx prisma db push` to create the tables
6. Run `npx prisma generate` to generate the Prisma client

## Development

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

## Deployment

### Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in [Vercel](https://vercel.com/new)
3. Add the required environment variables (including `DATABASE_URL` from Neon)
4. Deploy

The app will automatically deploy on every push to the main branch.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth API route
│   │   └── girandolas/          # Girandola CRUD endpoints
│   │       ├── route.ts         # GET all, POST new
│   │       └── export/route.ts  # GET user's own (for CSV export)
│   └── [locale]/                # Localized pages
├── auth/                        # NextAuth configuration
├── components/                  # React components
│   └── map/                     # Map components
├── generated/prisma/            # Generated Prisma client (gitignored)
├── i18n/                        # Internationalization config
├── lib/
│   └── prisma.ts                # Prisma client singleton
└── types/                       # TypeScript types
prisma/
└── schema.prisma                # Database schema
messages/                        # Translation files (en.json, it.json)
```

## License

MIT
