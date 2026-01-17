"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { MapComponent } from "@/components/map";
import AddGirandolaDialog from "@/components/AddGirandolaDialog";
import { useNativeGeolocation } from "@/hooks/useNativeGeolocation";
import type { Girandola } from "@/types/girandola";

export default function DashboardClient() {
  const t = useTranslations("addGirandola");
  const tCommon = useTranslations("common");
  const tMap = useTranslations("map");
  const { getCurrentPosition } = useNativeGeolocation();

  const [girandolas, setGirandolas] = useState<Girandola[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickMode, setPickMode] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showConfirmBar, setShowConfirmBar] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);

  // GPS accuracy threshold in meters
  const GPS_ACCURACY_THRESHOLD = 10;

  // Fetch girandolas on mount
  useEffect(() => {
    fetchGirandolas();
  }, []);

  const fetchGirandolas = async () => {
    try {
      const response = await fetch("/api/girandolas");
      if (response.ok) {
        const data = await response.json();
        setGirandolas(data);
      }
    } catch (err) {
      console.error("Failed to fetch girandolas:", err);
    }
  };

  const saveGirandola = useCallback(async (lat: number, lng: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/girandolas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      const newGirandola = await response.json();
      setGirandolas((prev) => [newGirandola, ...prev]);

      // Reset all states
      setIsDialogOpen(false);
      setPickMode(false);
      setPendingLocation(null);
      setShowConfirmBar(false);
    } catch {
      setError(t("saveError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleUseGps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGpsAccuracy(null);

    try {
      // Use native geolocation on Android, browser API on web
      const position = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const accuracy = position.coords.accuracy;
      setGpsAccuracy(accuracy);

      // Set pending location to center map and show marker
      setPendingLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setIsDialogOpen(false);
      setShowConfirmBar(true);
    } catch (err) {
      console.error("Geolocation error:", err);
      setError(t("locationError"));
    } finally {
      setIsLoading(false);
    }
  }, [t, getCurrentPosition]);

  const handlePickOnMap = useCallback(() => {
    setIsDialogOpen(false);
    setPickMode(true);
    setError(null);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (pickMode) {
      setPendingLocation({ lat, lng });
      setShowConfirmBar(true);
    }
  }, [pickMode]);

  const handleConfirmLocation = useCallback(() => {
    if (pendingLocation) {
      saveGirandola(pendingLocation.lat, pendingLocation.lng);
    }
  }, [pendingLocation, saveGirandola]);

  const handleCancelPick = useCallback(() => {
    setPickMode(false);
    setPendingLocation(null);
    setShowConfirmBar(false);
    setGpsAccuracy(null);
  }, []);

  const handleLocateMe = useCallback(async () => {
    setIsLocating(true);
    setError(null);

    try {
      const position = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      setMyLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } catch (err) {
      console.error("Geolocation error:", err);
      setError(t("locationError"));
    } finally {
      setIsLocating(false);
    }
  }, [getCurrentPosition, t]);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setError(null);
  }, []);

  return (
    <div className="relative h-[calc(100vh-57px)] w-full">
      {/* Map */}
      <MapComponent
        girandolas={girandolas}
        pickMode={pickMode}
        onMapClick={handleMapClick}
        pendingLocation={pendingLocation}
        newMarkerLabel={t("newMarker")}
        focusLocation={myLocation}
      />

      {/* GPS Locate Button */}
      {!pickMode && !showConfirmBar && (
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="fixed bottom-6 right-4 z-[500] flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50"
          title={tMap("locateMe")}
        >
          {isLocating ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
          )}
        </button>
      )}

      {/* Floating Action Button */}
      {!pickMode && (
        <button
          onClick={() => setIsDialogOpen(true)}
          className="fixed bottom-6 left-1/2 z-[500] flex -translate-x-1/2 items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("button")}
        </button>
      )}

      {/* Pick Mode Instruction Bar */}
      {pickMode && !showConfirmBar && (
        <div className="fixed bottom-6 left-1/2 z-[500] flex -translate-x-1/2 items-center gap-4 rounded-full bg-gray-900 px-6 py-3 text-white shadow-lg">
          <span className="text-sm font-medium">{t("pickOnMapInstruction")}</span>
          <button
            onClick={handleCancelPick}
            className="rounded-full bg-white/20 px-3 py-1 text-sm transition-colors hover:bg-white/30"
          >
            {tCommon("cancel")}
          </button>
        </div>
      )}

      {/* Confirm Location Bar */}
      {showConfirmBar && pendingLocation && (
        <div className="fixed bottom-6 left-1/2 z-[500] flex -translate-x-1/2 flex-col items-center gap-2 rounded-2xl bg-white p-3 shadow-xl">
          {/* GPS Accuracy Display */}
          {gpsAccuracy !== null && (
            <div className={`flex items-center gap-2 text-sm font-medium ${
              gpsAccuracy <= GPS_ACCURACY_THRESHOLD ? "text-green-600" : "text-red-600"
            }`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span>
                {t("accuracy")}: {Math.round(gpsAccuracy)}m
                {gpsAccuracy > GPS_ACCURACY_THRESHOLD && (
                  <span className="ml-1">({t("accuracyTooLow")})</span>
                )}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="px-3 text-sm font-medium text-gray-700">
              {t("confirmLocation")}
            </span>
            <button
              onClick={handleCancelPick}
              disabled={isLoading}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              {tCommon("cancel")}
            </button>
            <button
              onClick={handleConfirmLocation}
              disabled={isLoading || (gpsAccuracy !== null && gpsAccuracy > GPS_ACCURACY_THRESHOLD)}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {tCommon("saving")}
                </>
              ) : (
                tCommon("confirm")
              )}
            </button>
          </div>
        </div>
      )}

      {/* Add Girandola Dialog */}
      <AddGirandolaDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onUseGps={handleUseGps}
        onPickOnMap={handlePickOnMap}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
