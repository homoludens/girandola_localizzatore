# Deploying Girandola to Vercel

This guide covers deploying the Girandola application to Vercel with Neon Postgres.

## Prerequisites

Before deploying, ensure you have:

1. A [Vercel account](https://vercel.com/signup)
2. A [Neon account](https://console.neon.tech/) with a database created
3. A [Google Cloud project](https://console.cloud.google.com/) with OAuth credentials
4. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Neon Database

If you haven't already set up your Neon database:

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string (it looks like `postgresql://user:password@host/database?sslmode=require`)
4. Run the Prisma migrations locally first:
   ```bash
   # Set DATABASE_URL in .env.local
   npx prisma db push
   ```

## Step 2: Configure Google OAuth for Production

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add your production redirect URI:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
   Replace `your-app-name` with your actual Vercel app name/domain.

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel New Project](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect Next.js settings
4. Add the following environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `NEXTAUTH_SECRET` | A random 32-character string (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth client secret |

5. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

Then add environment variables via:
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
```

## Step 4: Post-Deployment Configuration

### Update NEXTAUTH_URL

After your first deployment, update the `NEXTAUTH_URL` environment variable to match your actual Vercel URL:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Update `NEXTAUTH_URL` to `https://your-actual-domain.vercel.app`
4. Redeploy for changes to take effect

### Verify Google OAuth Redirect

Ensure your Google OAuth redirect URI matches exactly:
```
https://your-actual-domain.vercel.app/api/auth/callback/google
```

## Step 5: Database Migrations (If Needed)

If you make schema changes after deployment:

```bash
# Generate migration
npx prisma migrate dev --name your_migration_name

# Apply to production (use with caution)
npx prisma migrate deploy
```

Or for simpler projects:
```bash
# Push schema changes directly (resets data if destructive)
npx prisma db push
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `NEXTAUTH_SECRET` | Yes | Secret for encrypting JWT tokens |
| `NEXTAUTH_URL` | Yes | Full URL of your deployed app |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |

## Troubleshooting

### "Invalid redirect_uri" Error

- Ensure your Google OAuth redirect URI exactly matches: `https://your-domain.vercel.app/api/auth/callback/google`
- Check for trailing slashes or http vs https mismatches

### Database Connection Errors

- Verify your `DATABASE_URL` is correct
- Ensure Neon project is active (free tier may pause after inactivity)
- Check if you need to run `npx prisma db push` to sync schema

### Authentication Not Working

- Verify `NEXTAUTH_URL` matches your actual domain
- Regenerate `NEXTAUTH_SECRET` if needed
- Check Vercel function logs for detailed errors

### Build Failures

```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Ensure Prisma client is generated
npx prisma generate
```

## Continuous Deployment

Once connected, Vercel automatically deploys:

- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches / every PR

You can configure branch settings in Vercel project settings.

## Custom Domain (Optional)

1. Go to your Vercel project > Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain
5. Add new redirect URI in Google OAuth settings
