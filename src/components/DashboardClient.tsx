"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { MapComponent, type MapLayer } from "@/components/map";
import AddGirandolaDialog from "@/components/AddGirandolaDialog";
import { useNativeGeolocation } from "@/hooks/useNativeGeolocation";
import type { Girandola } from "@/types/girandola";

// Height of the status bar in pixels
const STATUS_BAR_HEIGHT = 56;
// Extra padding for mobile browser navigation bar
const BROWSER_NAV_PADDING = 66;

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
  const [currentGpsStatus, setCurrentGpsStatus] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [mapLayer, setMapLayer] = useState<MapLayer>("osm");

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

      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setMyLocation(newLocation);
      setCurrentGpsStatus({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
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

  // Format coordinate for display (shortened)
  const formatCoord = (coord: number) => coord.toFixed(4);

  return (
    <div className="relative flex h-[calc(100vh-57px)] w-full flex-col">
      {/* Map - takes remaining space above status bar */}
      <div className="flex-1">
        <MapComponent
          girandolas={girandolas}
          pickMode={pickMode}
          onMapClick={handleMapClick}
          pendingLocation={pendingLocation}
          newMarkerLabel={t("newMarker")}
          focusLocation={myLocation}
          mapLayer={mapLayer}
        />
      </div>

      {/* Bottom Status Bar */}
      {!showConfirmBar && !pickMode && (
        <div
          className="flex items-center justify-between border-t border-gray-200 bg-white px-3"
          style={{ minHeight: STATUS_BAR_HEIGHT, paddingBottom: BROWSER_NAV_PADDING }}
        >
          {/* Left buttons group */}
          <div className="flex items-center gap-1">
            {/* Location Button */}
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="flex h-10 w-10 items-center justify-center rounded-full text-blue-600 transition-colors hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50"
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
                  className="h-6 w-6"
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

            {/* Map Layer Toggle Button */}
            <button
              onClick={() => setMapLayer(mapLayer === "osm" ? "satellite" : "osm")}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200"
              title={tMap(mapLayer === "osm" ? "switchToSatellite" : "switchToMap")}
            >
              {mapLayer === "osm" ? (
                // Satellite icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
              ) : (
                // Map icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* GPS Status */}
          <div className="flex flex-col items-center text-xs text-gray-500">
            {currentGpsStatus ? (
              <>
                <span className="font-mono">
                  {formatCoord(currentGpsStatus.lat)}, {formatCoord(currentGpsStatus.lng)}
                </span>
                <span className={`font-medium ${
                  currentGpsStatus.accuracy <= GPS_ACCURACY_THRESHOLD ? "text-green-600" : "text-orange-500"
                }`}>
                  ±{Math.round(currentGpsStatus.accuracy)}m
                </span>
              </>
            ) : (
              <span className="text-gray-400">{tMap("noGpsData")}</span>
            )}
          </div>

          {/* Add Marker Button */}
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
            title={t("button")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      )}

      {/* Pick Mode Instruction Bar */}
      {pickMode && !showConfirmBar && (
        <div
          className="flex items-center justify-between border-t border-gray-200 bg-gray-900 px-4 text-white"
          style={{ minHeight: STATUS_BAR_HEIGHT, paddingBottom: BROWSER_NAV_PADDING }}
        >
          <span className="text-sm font-medium">{t("pickOnMapInstruction")}</span>
          <button
            onClick={handleCancelPick}
            className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-white/30"
          >
            {tCommon("cancel")}
          </button>
        </div>
      )}

      {/* Confirm Location Bar */}
      {showConfirmBar && pendingLocation && (
        <div
          className="flex flex-col items-center justify-center border-t border-gray-200 bg-white px-4"
          style={{ minHeight: STATUS_BAR_HEIGHT, paddingBottom: BROWSER_NAV_PADDING }}
        >
          {/* GPS Accuracy Display */}
          {gpsAccuracy !== null && (
            <div className={`mb-1 flex items-center gap-1 text-xs font-medium ${
              gpsAccuracy <= GPS_ACCURACY_THRESHOLD ? "text-green-600" : "text-red-600"
            }`}>
              <span>
                {t("accuracy")}: {Math.round(gpsAccuracy)}m
                {gpsAccuracy > GPS_ACCURACY_THRESHOLD && (
                  <span className="ml-1">({t("accuracyTooLow")})</span>
                )}
              </span>
            </div>
          )}
          <div className="flex w-full items-center justify-between gap-3">
            <span className="text-sm font-medium text-gray-700">
              {t("confirmLocation")}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancelPick}
                disabled={isLoading}
                className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
              >
                {tCommon("cancel")}
              </button>
              <button
                onClick={handleConfirmLocation}
                disabled={isLoading || (gpsAccuracy !== null && gpsAccuracy > GPS_ACCURACY_THRESHOLD)}
                className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
