"use client";

import { useState, useCallback, useEffect } from "react";

// Types for Capacitor Geolocation plugin
interface Position {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface PositionOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface GeolocationPlugin {
  getCurrentPosition(options?: PositionOptions): Promise<Position>;
  checkPermissions(): Promise<{ location: string; coarseLocation: string }>;
  requestPermissions(): Promise<{ location: string; coarseLocation: string }>;
}

export function useNativeGeolocation() {
  const [isNative, setIsNative] = useState(false);

  // Check if running on native platform
  useEffect(() => {
    if (typeof window !== "undefined" && window.Capacitor) {
      setIsNative(window.Capacitor.isNativePlatform());
    }
  }, []);

  // Get current position using Capacitor Geolocation on native, or browser API on web
  const getCurrentPosition = useCallback(
    async (options?: PositionOptions): Promise<Position> => {
      // Use Capacitor Geolocation on native platforms
      if (isNative && typeof window !== "undefined" && window.Capacitor) {
        // Access Geolocation plugin - cast to unknown first since Plugins type may vary
        const Geolocation = (window.Capacitor.Plugins as Record<string, unknown>).Geolocation as GeolocationPlugin | undefined;
        
        if (Geolocation) {
          // Check and request permissions
          const permStatus = await Geolocation.checkPermissions();
          if (permStatus.location !== "granted") {
            const requestResult = await Geolocation.requestPermissions();
            if (requestResult.location !== "granted") {
              throw new Error("Location permission denied");
            }
          }

          // Get current position
          return await Geolocation.getCurrentPosition({
            enableHighAccuracy: options?.enableHighAccuracy ?? true,
            timeout: options?.timeout ?? 10000,
            maximumAge: options?.maximumAge ?? 0,
          });
        }
      }

      // Fallback to browser geolocation API
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                speed: position.coords.speed,
              },
              timestamp: position.timestamp,
            });
          },
          (error) => {
            reject(new Error(error.message));
          },
          {
            enableHighAccuracy: options?.enableHighAccuracy ?? true,
            timeout: options?.timeout ?? 10000,
            maximumAge: options?.maximumAge ?? 0,
          }
        );
      });
    },
    [isNative]
  );

  return {
    isNative,
    getCurrentPosition,
  };
}
