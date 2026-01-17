import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.droopia.girandola',
  appName: 'Girandola Localizzatore',
  webDir: 'out',
  // Use WebView to load the Vercel-hosted app for full functionality
  // This enables API routes, authentication, and database operations
  server: {
    // For development, use local URL. For production, use your Vercel URL.
    // Uncomment the line below and set your production URL:
    url: 'https://girandola-localizzatore.vercel.app',
    cleartext: true, // Allow HTTP for development
  },
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false,
      },
      google: {
             webClientId: "149267535489-534vviffsg2ft0hq0atjrq0nhh6pn696.apps.googleusercontent.com",
      }
    },
    GoogleAuth: {
        scopes: ["profile", "email"],
        androidClientId: "149267535489-obsu9vevmcu3ujod8a9tu31gvlu1kttk.apps.googleusercontent.com",
        serverClientId: "149267535489-534vviffsg2ft0hq0atjrq0nhh6pn696.apps.googleusercontent.com",
        forceCodeForRefreshToken: true,
      },
  },
};

export default config;
