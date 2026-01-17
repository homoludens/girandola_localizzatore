"use client";

import { useState, useCallback, useEffect } from "react";
import { signIn } from "next-auth/react";

// Types for Capacitor and Google Auth plugin
interface GoogleLoginResult {
  idToken: string;
  accessToken?: {
    token: string;
  };
  profile: {
    email: string;
    familyName?: string;
    givenName?: string;
    id: string;
    name: string;
    imageUrl?: string;
  };
}

interface GoogleAuthPlugin {
  login(options: { scopes: string[] }): Promise<GoogleLoginResult>;
  logout(): Promise<void>;
  isLoggedIn(): Promise<{ isLoggedIn: boolean }>;
  initialize(options: { google: { webClientId: string } }): Promise<void>;
}

interface CapacitorGlobal {
  isNativePlatform(): boolean;
  Plugins: {
    SocialLogin?: GoogleAuthPlugin;
  };
}

declare global {
  interface Window {
    Capacitor?: CapacitorGlobal;
  }
}

export function useNativeAuth() {
  const [isNative, setIsNative] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if running on native platform
  useEffect(() => {
    const checkPlatform = async () => {
      if (typeof window !== "undefined" && window.Capacitor) {
        const native = window.Capacitor.isNativePlatform();
        setIsNative(native);
        
        if (native) {
          // Initialize Google Auth plugin
          try {
            const SocialLogin = window.Capacitor.Plugins.SocialLogin;
            if (!SocialLogin) {
              console.error("SocialLogin plugin not found in Capacitor.Plugins");
              setError("Native login plugin not available");
              setIsInitialized(true);
              return;
            }
            
            const webClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            if (!webClientId) {
              console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
              setError("Google Client ID not configured");
              setIsInitialized(true);
              return;
            }
            
            // The webClientId should match your Google OAuth Web Client ID
            // This is configured in strings.xml for Android
            console.log("Initializing SocialLogin with webClientId:", webClientId);
            await SocialLogin.initialize({
              google: {
                webClientId: webClientId,
              },
            });
            console.log("SocialLogin initialized successfully");
            setIsInitialized(true);
          } catch (err) {
            console.error("Failed to initialize SocialLogin:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`Failed to initialize native login: ${errorMessage}`);
            setIsInitialized(true);
          }
        }
      }
      setIsInitialized(true);
    };

    checkPlatform();
  }, []);

  // Native Google Sign-In
  const nativeSignIn = useCallback(async (): Promise<boolean> => {
    if (!isNative || typeof window === "undefined" || !window.Capacitor) {
      setError("Native login not available");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const SocialLogin = window.Capacitor.Plugins.SocialLogin;
      if (!SocialLogin) {
        throw new Error("SocialLogin plugin not available");
      }

      // Trigger native Google Sign-In
      const result = await SocialLogin.login({
        scopes: ["email", "profile"],
      });

      if (!result.idToken) {
        throw new Error("No ID token received from Google");
      }

      // Use the ID token to sign in via NextAuth credentials provider
      const signInResult = await signIn("google-native", {
        idToken: result.idToken,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      // Redirect to home page on success
      if (signInResult?.ok) {
        window.location.href = "/";
        return true;
      }

      return false;
    } catch (err) {
      console.error("Native sign-in error:", err);
      setError(err instanceof Error ? err.message : "Sign-in failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isNative]);

  // Native Sign-Out
  const nativeSignOut = useCallback(async (): Promise<void> => {
    if (!isNative || typeof window === "undefined" || !window.Capacitor) {
      return;
    }

    try {
      const SocialLogin = window.Capacitor.Plugins.SocialLogin;
      if (SocialLogin) {
        await SocialLogin.logout();
      }
    } catch (err) {
      console.error("Native sign-out error:", err);
    }
  }, [isNative]);

  return {
    isNative,
    isLoading,
    isInitialized,
    error,
    nativeSignIn,
    nativeSignOut,
  };
}
