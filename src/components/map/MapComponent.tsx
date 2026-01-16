"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Girandola } from "@/types/girandola";

// Fix for Leaflet default marker icon issue in Next.js/Webpack
// The default marker icons are not bundled correctly, so we need to configure them manually
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  girandolas?: Girandola[];
  pickMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  pendingLocation?: { lat: number; lng: number } | null;
}

// Component to handle map resize when container changes
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    // Invalidate size after a short delay to ensure container is fully rendered
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timeout);
  }, [map]);

  return null;
}

// Component to handle map click events
function MapClickHandler({
  onMapClick,
  pickMode,
}: {
  onMapClick?: (lat: number, lng: number) => void;
  pickMode?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (pickMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
}

// Component to pan to pending location
function PanToLocation({ location }: { location: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.panTo([location.lat, location.lng]);
    }
  }, [map, location]);

  return null;
}

export default function MapComponent({
  center = [45.0703, 7.6869], // Default to Turin, Italy (near Piedmont region)
  zoom = 13,
  className = "",
  girandolas = [],
  pickMode = false,
  onMapClick,
  pendingLocation = null,
}: MapComponentProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`h-full w-full ${className} ${pickMode ? "cursor-crosshair" : ""}`}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResizeHandler />
      <MapClickHandler onMapClick={onMapClick} pickMode={pickMode} />
      <PanToLocation location={pendingLocation} />

      {/* Render existing girandolas */}
      {girandolas.map((girandola) => (
        <Marker key={girandola.id} position={[girandola.lat, girandola.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-medium">{girandola.userEmail}</p>
              <p className="text-gray-500">
                {new Date(girandola.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Render pending location marker */}
      {pendingLocation && (
        <Marker position={[pendingLocation.lat, pendingLocation.lng]}>
          <Popup>
            <div className="text-sm font-medium">New Girandola</div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
