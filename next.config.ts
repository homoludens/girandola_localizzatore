import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// Set CAPACITOR_BUILD=true for static export (Android app)
// Normal builds (Vercel) don't use static export
const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";

const nextConfig: NextConfig = {
  // Static export mode for Capacitor builds only
  // Note: API routes won't work in static mode - the Android app
  // should use a WebView pointing to the Vercel URL for full functionality
  ...(isCapacitorBuild && { output: "export" }),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
    // Required for static export
    ...(isCapacitorBuild && { unoptimized: true }),
  },
};

export default withNextIntl(nextConfig);
