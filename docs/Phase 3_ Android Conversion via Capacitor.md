# **Phase 3: Android Conversion via Capacitor**

Use these prompts to add Android support to the existing "Girandola Localizzatore" Next.js project.

## **📝 Task 13: Initializing Capacitor**

**Prompt:** I want to add an Android app to this project using Capacitor while keeping the Next.js codebase.

1. Install `@capacitor/core`, `@capacitor/cli`, and `@capacitor/android`.  
2. Initialize Capacitor: `npx cap init "Girandola Localizzatore" "com.girandola.app"`.  
3. In `next.config.mjs`, set `output: 'export'`. (Note: We will discuss how to handle the Server Actions vs. Static Export trade-off).  
4. Modify `package.json` to add a script: `"static-build": "next build && npx cap copy"`.  
5. Add the Android platform: `npx cap add android`.

## **📝 Task 14: Handling Native Google Login (The Shell)**

**Prompt:** To allow users to log in natively on Android without a browser popup, we need the Capacitor Google Auth plugin.

1. Install `@capacitor-community/google-auth`.  
2. Configure `capacitor.config.json` to include the `GoogleAuth` plugin settings.  
3. You need to create a NEW **Android Client ID** in the Google Cloud Console (separate from the Web Client ID).  
4. Update `strings.xml` in the Android folder to include the `server_client_id` (which should be your Web Client ID).  
5. Provide instructions on how to find the SHA-1 fingerprint of the debug keystore to register the Android app in Google Console.

## **📝 Task 15: Integrating Native Auth with NextAuth**

**Prompt:** I need to bridge the Native Google Login with my existing NextAuth setup.

1. Create a `useNativeAuth` hook.  
2. If the app is running on a Native platform (check `Capacitor.isNativePlatform()`), the "Login" button should trigger `GoogleAuth.signIn()`.  
3. Once the native sign-in returns an `id_token`, use the NextAuth `signIn('credentials', ...)` method or a custom provider to validate this token against our Postgres DB.  
4. Ensure the session remains persistent within the Android app.

## **📝 Task 16: Optimizing Map & GPS for Android**

**Prompt:** Leaflet works in a WebView, but we should ensure the GPS experience feels native.

1. Install `@capacitor/geolocation`.  
2. Update the "Add Girandola" logic: If on native, use `Geolocation.getCurrentPosition()` from Capacitor instead of the browser's `navigator.geolocation`.  
3. This ensures the app correctly requests Android Permissions (Fine Location) via the native OS prompt.  
4. Update the Android `AndroidManifest.xml` to include `ACCESS_FINE_LOCATION` permissions.

