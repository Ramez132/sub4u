"use client";

import { useEffect, useRef } from "react";

type Listing = {
  id: number;
  title: string;
  city: string;
  neighborhood: string | null;
  price: number;
  start_date: string;
  end_date: string;
};

type Props = {
  listings: Listing[];
  lang: "en" | "he";
};

// Approximate coordinates for supported cities
const cityCoordinates: Record<string, [number, number]> = {
  "Tel Aviv": [32.0853, 34.7818],
  "Ramat Gan": [32.0684, 34.8248],
  "Herzliya": [32.1663, 34.8435],
  "Givatayim": [32.0704, 34.8098],
};

// Default center of Israel
const DEFAULT_CENTER: [number, number] = [32.0879, 34.8296];

export default function ListingsMap({ listings, lang }: Props) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHe = lang === "he";

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // Already initialized

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Create map
      const map = L.map(containerRef.current!, {
        center: DEFAULT_CENTER,
        zoom: 12,
        zoomControl: true,
      });

      mapRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom teal pin icon
      const customIcon = L.divIcon({
        html: `
          <div style="
            background: #0891b2;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-size: 11px;
              font-weight: 700;
              font-family: sans-serif;
            ">₪</div>
          </div>
        `,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -36],
      });

      // Add markers for each listing
      listings.forEach((listing) => {
        const coords = cityCoordinates[listing.city];
        if (!coords) return;

        // Add small random offset so multiple listings in same city don't overlap
        const lat = coords[0] + (Math.random() - 0.5) * 0.015;
        const lng = coords[1] + (Math.random() - 0.5) * 0.015;

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
            <p style="font-weight: 700; font-size: 14px; margin: 0 0 4px; color: #0f172a;">${listing.title}</p>
            <p style="font-size: 12px; color: #64748b; margin: 0 0 4px;">📍 ${listing.city}${listing.neighborhood ? `, ${listing.neighborhood}` : ""}</p>
            <p style="font-size: 15px; font-weight: 700; color: #0891b2; margin: 0 0 8px;">₪${listing.price.toLocaleString()}<span style="font-size:11px;font-weight:400;color:#94a3b8"> / ${isHe ? "חודש" : "month"}</span></p>
            <a href="/listings/${listing.id}?lang=${lang}" style="
              display: block;
              background: #0891b2;
              color: white;
              text-align: center;
              padding: 6px 12px;
              border-radius: 100px;
              text-decoration: none;
              font-size: 12px;
              font-weight: 600;
            ">${isHe ? "לצפייה במודעה" : "View listing"}</a>
          </div>
        `, { maxWidth: 220 });
      });

      // Fit map to show all markers
      const validListings = listings.filter((l) => cityCoordinates[l.city]);
      if (validListings.length > 0) {
        const bounds = validListings.map((l) => cityCoordinates[l.city]);
        map.fitBounds(bounds as any, { padding: [40, 40], maxZoom: 13 });
      }
    });

    // Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-gray-200 shadow-sm" style={{ height: "420px" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      {listings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <p className="text-gray-400 text-sm">{isHe ? "אין מודעות להצגה" : "No listings to show"}</p>
        </div>
      )}
    </div>
  );
}