"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { MapComponent } from "@/components/map";
import AddGirandolaDialog from "@/components/AddGirandolaDialog";
import type { Girandola } from "@/types/girandola";

export default function DashboardClient() {
  const t = useTranslations("addGirandola");
  const tCommon = useTranslations("common");

  const [girandolas, setGirandolas] = useState<Girandola[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickMode, setPickMode] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showConfirmBar, setShowConfirmBar] = useState(false);

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

  const handleUseGps = useCallback(() => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(t("locationError"));
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveGirandola(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError(t("locationError"));
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [t, saveGirandola]);

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
  }, []);

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
      />

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
        <div className="fixed bottom-6 left-1/2 z-[500] flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-white p-2 shadow-xl">
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
            disabled={isLoading}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
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
