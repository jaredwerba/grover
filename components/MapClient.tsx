"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { LatLngBoundsExpression } from "leaflet";
import { Dispensary } from "@/lib/dispensaries";

// Custom amber pin marker matching Cove design
const amberIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #FFB900;
      border: 2px solid #0f2d1c;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    "></div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

const activeIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      background: #FFB900;
      border: 3px solid #f7eed8;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 0 0 3px rgba(255,185,0,0.4), 0 4px 12px rgba(0,0,0,0.6);
    "></div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -36],
});

// Fly-to helper when selected dispensary changes
function FlyToMarker({ dispensary }: { dispensary: Dispensary | null }) {
  const map = useMap();
  useEffect(() => {
    if (dispensary) {
      map.flyTo([dispensary.lat, dispensary.lng], 14, { duration: 0.8 });
    }
  }, [dispensary, map]);
  return null;
}

interface MapClientProps {
  dispensaries: Dispensary[];
  selected: Dispensary | null;
  onSelect: (d: Dispensary) => void;
}

// Vermont bounding box — SW corner to NE corner
const VERMONT_BOUNDS: LatLngBoundsExpression = [
  [42.726, -73.437], // SW — southern tip near Pownal
  [45.017, -71.464], // NE — northern tip near Derby Line
];

export default function MapClient({ dispensaries, selected, onSelect }: MapClientProps) {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <MapContainer
      bounds={VERMONT_BOUNDS}
      boundsOptions={{ padding: [12, 12] }}
      className="w-full h-full"
      ref={mapRef}
      zoomControl={false}
      style={{ background: "#0b2d1b" }}
    >
      {/* CartoDB Dark Matter — free, no API key, dark with borders/labels */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_matter/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />

      <FlyToMarker dispensary={selected} />

      {dispensaries.map((d) => (
        <Marker
          key={d.id}
          position={[d.lat, d.lng]}
          icon={selected?.id === d.id ? activeIcon : amberIcon}
          eventHandlers={{ click: () => onSelect(d) }}
        >
          <Popup
            className="cove-popup"
            closeButton={false}
            offset={[0, -20]}
          >
            <div
              style={{
                background: "#0f2d1c",
                border: "1px solid rgba(255,185,0,0.3)",
                borderRadius: "2px",
                padding: "10px 12px",
                minWidth: "180px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
              }}
            >
              <p style={{ color: "#FFB900", fontWeight: 700, fontSize: "13px", marginBottom: "2px", lineHeight: 1.3 }}>
                {d.name}
              </p>
              <p style={{ color: "#c4b89a", fontSize: "11px", marginBottom: "6px" }}>
                {d.city}
              </p>
              {d.phone && (
                <p style={{ color: "#c4b89a", fontSize: "11px" }}>{d.phone}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
