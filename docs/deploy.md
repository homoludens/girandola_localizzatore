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

---

# Deploying the Android App

The Android app uses Capacitor to wrap the web application in a native WebView. This approach allows the same codebase to work on both Vercel (web) and Android.

## Prerequisites

1. [Android Studio](https://developer.android.com/studio) installed
2. Android SDK configured (Android Studio will guide you)
3. Your app deployed to Vercel (see above)
4. A physical Android device or emulator for testing

## Step 1: Configure Capacitor for Production

Edit `capacitor.config.ts` to point to your Vercel URL:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.girandola.app',
  appName: 'Girandola Localizzatore',
  webDir: 'out',
  server: {
    // Set your production Vercel URL here
    url: 'https://girandola.vercel.app',
    cleartext: false, // Use HTTPS in production
  },
};

export default config;
```

## Step 2: Add Android Platform (If Not Already Done)

```bash
# Create placeholder for web assets
mkdir -p out && echo '<!DOCTYPE html><html><body>Loading...</body></html>' > out/index.html

# Add Android platform
npx cap add android
```

## Step 3: Sync and Open in Android Studio

```bash
# Copy web assets and sync plugins
npx cap sync android

# Open in Android Studio
npx cap open android
```

## Step 4: Configure Google OAuth for Android

For Google Sign-In to work in the Android app, you need to add the Android app to your Google OAuth configuration:

### 4.1 Get Your SHA-1 Fingerprint

In Android Studio terminal or your system terminal:

```bash
# For debug builds
cd android
./gradlew signingReport
```

Look for the SHA-1 fingerprint under the `:app:signingReport` section.

### 4.2 Add Android Client in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "OAuth client ID"
4. Select "Android" as application type
5. Enter your package name: `com.girandola.app`
6. Paste your SHA-1 fingerprint
7. Click "Create"

### 4.3 Update OAuth Consent Screen (If Needed)

Ensure your OAuth consent screen includes:
- App name: Girandola Localizzatore
- Authorized domains: your Vercel domain

## Step 5: Build the Android App

### Debug Build (For Testing)

In Android Studio:
1. Select "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"
2. The APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`

Or via command line:
```bash
cd android
./gradlew assembleDebug
```

### Release Build (For Play Store)

1. Generate a signing key:
   ```bash
   keytool -genkey -v -keystore girandola-release.keystore -alias girandola -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Configure signing in `android/app/build.gradle`:
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('path/to/girandola-release.keystore')
               storePassword 'your-store-password'
               keyAlias 'girandola'
               keyPassword 'your-key-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. Build the release APK or AAB:
   ```bash
   cd android
   ./gradlew assembleRelease
   # Or for App Bundle (recommended for Play Store)
   ./gradlew bundleRelease
   ```

## Step 6: Test on Device

### Using ADB (Android Debug Bridge)

```bash
# List connected devices
adb devices

# Install debug APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Using Android Studio

1. Connect your Android device via USB
2. Enable USB debugging on your device
3. Click the "Run" button in Android Studio
4. Select your device from the list

## Step 7: Publish to Google Play Store (Optional)

1. Create a [Google Play Developer account](https://play.google.com/console/) ($25 one-time fee)
2. Create a new app in the Play Console
3. Fill in the store listing details
4. Upload your signed AAB (App Bundle) file
5. Complete the content rating questionnaire
6. Set up pricing and distribution
7. Submit for review

## Android Development Commands Reference

```bash
# Sync web assets to Android
npx cap sync android

# Copy web assets only (faster)
npx cap copy android

# Open in Android Studio
npx cap open android

# Run on connected device (requires Android Studio setup)
npx cap run android

# Build debug APK
cd android && ./gradlew assembleDebug

# Build release AAB
cd android && ./gradlew bundleRelease

# Clean build
cd android && ./gradlew clean
```

## Troubleshooting Android

### "Unable to load URL" or Blank Screen

- Verify `server.url` in `capacitor.config.ts` is correct
- Ensure your Vercel deployment is accessible
- Check if `cleartext: true` is needed for HTTP (development only)

### Google Sign-In Not Working

- Verify SHA-1 fingerprint matches in Google Cloud Console
- Check package name is exactly `com.girandola.app`
- Ensure both Web and Android OAuth clients exist
- Check Android Studio Logcat for detailed errors

### Build Errors

```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew build

# Sync Gradle files
# In Android Studio: File > Sync Project with Gradle Files
```

### App Crashes on Launch

- Check Logcat in Android Studio for stack traces
- Verify minimum SDK version compatibility
- Ensure all Capacitor plugins are synced: `npx cap sync android`

## Updating the Android App

When you update the web app on Vercel, the Android app automatically loads the new version (since it uses WebView). No app update is needed for web content changes.

For native changes (Capacitor plugins, Android configuration):

```bash
# Sync changes
npx cap sync android

# Rebuild and redistribute the APK/AAB
```
