import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.girandola.app',
  appName: 'Girandola Localizzatore',
  webDir: 'out',
  // Use WebView to load the Vercel-hosted app for full functionality
  // This enables API routes, authentication, and database operations
  server: {
    // For development, use local URL. For production, use your Vercel URL.
    // Uncomment the line below and set your production URL:
    // url: 'https://girandola.vercel.app',
    cleartext: true, // Allow HTTP for development
  },
};

export default config;
