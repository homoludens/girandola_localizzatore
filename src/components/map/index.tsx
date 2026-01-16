"use client";

import dynamic from "next/dynamic";

// Dynamically import MapComponent with SSR disabled
// Leaflet requires window/document which aren't available during SSR
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        <span className="text-sm text-gray-500">Loading map...</span>
      </div>
    </div>
  ),
});

export { MapComponent };
