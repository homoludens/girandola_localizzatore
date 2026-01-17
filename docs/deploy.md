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
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Yes (Android) | Same as GOOGLE_CLIENT_ID, exposed to client for native auth |

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
  appId: 'net.droopia.girandola',
  appName: 'Girandola Localizzatore',
  webDir: 'out',
  server: {
    // Set your production Vercel URL here
    url: 'https://girandola-localizzatore.vercel.app',
    cleartext: false, // Use HTTPS in production
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

## Step 4: Configure Native Google Sign-In for Android

The Android app uses the `@capgo/capacitor-social-login` plugin for native Google authentication. This allows users to sign in using their device's Google account without a browser popup.

### 4.1 Get Your SHA-1 Fingerprint

The SHA-1 fingerprint is required to register your Android app with Google. You need fingerprints for both debug and release builds.

#### Debug Fingerprint (for development)

```bash
# Option 1: Using Gradle (recommended)
cd android
./gradlew signingReport
```

Look for the SHA-1 fingerprint under the `:app:signingReport` section, specifically the `debug` variant.

```bash
# Option 2: Using keytool directly
# Default debug keystore location on Linux/macOS:
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Default debug keystore location on Windows:
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### Release Fingerprint (for production)

```bash
keytool -list -v -keystore /path/to/your-release.keystore -alias your-key-alias
```

You'll be prompted for the keystore password.

### 4.2 Create Android OAuth Client in Google Cloud Console

You need a **separate Android OAuth client** (different from your Web client):

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "OAuth client ID"
4. Select **"Android"** as application type
5. Enter your package name: `net.droopia.girandola`
6. Paste your **SHA-1 fingerprint** (from step 4.1)
7. Click "Create"

cliendid=
149267535489-obsu9vevmcu3ujod8a9tu31gvlu1kttk.apps.googleusercontent.com

**Important:** You need separate Android OAuth clients for debug and release if using different signing keys:
- Create one with debug SHA-1 for development
- Create another with release SHA-1 for production

### 4.3 Configure the Web Client ID in strings.xml

The native Google Sign-In requires your **Web Client ID** (not the Android Client ID) to work with your backend:

1. Find your **Web Client ID** in Google Cloud Console > Credentials
   - Look for the OAuth 2.0 Client ID with type "Web application"
   - It looks like: `123456789-abcdefg.apps.googleusercontent.com`

2. Edit `android/app/src/main/res/values/strings.xml`:
   ```xml
   <string name="server_client_id">YOUR_WEB_CLIENT_ID.apps.googleusercontent.com</string>
   ```

3. Sync the changes:
   ```bash
   npx cap sync android
   ```

### 4.4 Verify OAuth Consent Screen

Ensure your OAuth consent screen includes:
- App name: Girandola Localizzatore
- Authorized domains: your Vercel domain
- Scopes: email, profile, openid

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

---

# Native Geolocation for Android (Task 16)

The app uses `@capacitor/geolocation` for native GPS functionality on Android. This provides a better user experience with proper Android permission prompts.

## How It Works

1. **Platform Detection**: The `useNativeGeolocation` hook detects if the app is running on a native platform.

2. **Permission Handling**: On Android, the Capacitor Geolocation plugin handles:
   - Checking if location permissions are granted
   - Requesting permissions via native Android dialog
   - Returning the user's current position with high accuracy

3. **Fallback to Browser API**: On web (Vercel), the hook falls back to the standard browser `navigator.geolocation` API.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Android App                               │
├─────────────────────────────────────────────────────────────────┤
│  DashboardClient Component                                       │
│  └── useNativeGeolocation hook                                   │
│      ├── Detects native platform                                │
│      ├── Uses Capacitor Geolocation plugin                      │
│      ├── Requests ACCESS_FINE_LOCATION permission               │
│      └── Returns GPS coordinates                                │
└─────────────────────────────────────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useNativeGeolocation.ts` | Hook for native/web geolocation |
| `src/components/DashboardClient.tsx` | Uses hook for "Add Girandola" GPS feature |
| `android/app/src/main/AndroidManifest.xml` | Declares location permissions |

## Android Permissions

The following permissions are configured in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" />
```

- `ACCESS_COARSE_LOCATION`: Approximate location via network
- `ACCESS_FINE_LOCATION`: Precise GPS location
- `android.hardware.location.gps`: Declares GPS feature usage

## Testing Native Geolocation

1. **Sync Capacitor plugins**:
   ```bash
   npx cap sync android
   ```

2. **Run on Android device/emulator**:
   ```bash
   npx cap run android
   ```

3. **Test the GPS flow**:
   - Tap "Add Girandola" button
   - Select "Use My GPS"
   - Android permission dialog should appear asking for location access
   - After granting permission, map should center on your location
   - Confirm to save the girandola

## Troubleshooting Native Geolocation

### Permission Denied

- User may have denied location permission
- Go to Android Settings > Apps > Girandola > Permissions > Location
- Enable location permission

### GPS Not Working on Emulator

- In Android Studio, open Extended Controls (three dots)
- Go to Location tab
- Set a mock location or enable GPS simulation

### Location Not Accurate

- Ensure `enableHighAccuracy: true` is set
- Check if device GPS is enabled in Android settings
- Test outdoors for better GPS signal

---

## Troubleshooting Android

### "Unable to load URL" or Blank Screen

- Verify `server.url` in `capacitor.config.ts` is correct
- Ensure your Vercel deployment is accessible
- Check if `cleartext: true` is needed for HTTP (development only)

### Google Sign-In Not Working

- Verify SHA-1 fingerprint matches in Google Cloud Console
- Check package name is exactly `net.droopia.girandola`
- Ensure both Web and Android OAuth clients exist in Google Cloud Console
- Verify `server_client_id` in `strings.xml` matches your Web Client ID
- Check Android Studio Logcat for detailed errors (filter by "SocialLogin" or "GoogleAuth")

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

---

# Native Authentication Integration (Task 15)

The app supports native Google Sign-In on Android, which provides a better user experience compared to browser-based OAuth. Users can sign in with their device's Google account without being redirected to a browser.

## How It Works

1. **Platform Detection**: The `useNativeAuth` hook detects if the app is running on a native platform using `Capacitor.isNativePlatform()`.

2. **Native Sign-In Flow**:
   - On Android: Uses `@capgo/capacitor-social-login` to trigger native Google Sign-In
   - Returns a Google ID token upon successful authentication

3. **Token Validation**: The ID token is sent to NextAuth's credentials provider (`google-native`), which:
   - Validates the token with Google's OAuth2 API
   - Finds or creates the user in the Postgres database
   - Creates a JWT session for the user

4. **Session Persistence**: The JWT session is stored in cookies and persists across app restarts.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Android App                               │
├─────────────────────────────────────────────────────────────────┤
│  LoginButton Component                                           │
│  ├── useNativeAuth hook                                         │
│  │   ├── Detects native platform                                │
│  │   └── Triggers SocialLogin.login()                           │
│  └── On success: calls signIn("google-native", {idToken})       │
├─────────────────────────────────────────────────────────────────┤
│                        WebView                                   │
│  └── Loads https://girandola-localizzatore.vercel.app           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Vercel (NextAuth)                           │
├─────────────────────────────────────────────────────────────────┤
│  Credentials Provider "google-native"                            │
│  ├── Receives ID token                                          │
│  ├── Validates with Google OAuth2 API                           │
│  └── Returns user object                                        │
├─────────────────────────────────────────────────────────────────┤
│  JWT Callback                                                    │
│  ├── Finds/creates user in Postgres                             │
│  └── Returns JWT with userId                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useNativeAuth.ts` | Hook for native platform detection and Google Sign-In |
| `src/components/LoginButton.tsx` | Client component that uses native auth on Android |
| `src/auth/config.ts` | NextAuth config with `google-native` credentials provider |
| `src/auth/index.ts` | Main auth handler with user creation logic |
| `src/app/[locale]/login/page.tsx` | Login page using LoginButton component |

## Environment Variables for Native Auth

Add these to your Vercel deployment:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Your Web Client ID (same as `GOOGLE_CLIENT_ID`). Must be prefixed with `NEXT_PUBLIC_` to be accessible on the client. |

## Testing Native Auth

1. **Build and deploy to Vercel** to ensure the backend is ready
2. **Sync Capacitor**:
   ```bash
   npx cap sync android
   ```
3. **Run on Android device/emulator**:
   ```bash
   npx cap run android
   ```
4. **Test the login flow**:
   - Tap "Sign in with Google"
   - Native Google account picker should appear
   - After selecting account, you should be redirected to the home page
   - Session should persist after closing and reopening the app

## Troubleshooting Native Auth

### "No ID token received from Google"

- Ensure the Web Client ID in `strings.xml` is correct
- Verify Android OAuth client has correct SHA-1 fingerprint
- Check that Google Play Services is available on the device

### "Token audience mismatch"

- The ID token was issued for a different client ID
- Verify `GOOGLE_CLIENT_ID` environment variable matches the Web Client ID

### User created but session not persisting

- Check browser/WebView cookie settings
- Ensure `NEXTAUTH_URL` is set correctly
- Verify JWT callback is returning the correct userId

### Native sign-in works but user not in database

- Check Vercel function logs for database errors
- Verify `DATABASE_URL` is correct
- Ensure Prisma client is generated: `npx prisma generate`
