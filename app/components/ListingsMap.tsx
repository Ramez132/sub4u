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
  latitude?: number | null;
  longitude?: number | null;
};

type Props = {
  listings: Listing[];
  lang: "en" | "he";
};

const DEFAULT_CENTER: [number, number] = [32.0879, 34.8296];

export default function ListingsMap({ listings, lang }: Props) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHe = lang === "he";
  const mappableListings = listings.filter((l) => l.latitude && l.longitude);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(containerRef.current!, {
        center: DEFAULT_CENTER,
        zoom: 12,
        dragging: true,
        scrollWheelZoom: true,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mappableListings.forEach((listing) => {
        // Price label icon (shown on hover via tooltip)
        const priceIcon = L.divIcon({
          html: `
            <div style="
              background: #0891b2;
              color: white;
              font-size: 12px;
              font-weight: 700;
              font-family: sans-serif;
              padding: 4px 8px;
              border-radius: 100px;
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.25);
              white-space: nowrap;
              cursor: pointer;
            ">₪${listing.price.toLocaleString()}</div>
          `,
          className: "",
          iconSize: [80, 28],
          iconAnchor: [40, 14],
          popupAnchor: [0, -20],
        });

        const marker = L.marker([listing.latitude!, listing.longitude!], { icon: priceIcon }).addTo(map);

        // Tooltip on hover (shows price persistently as label)
        marker.bindTooltip(`
          <div style="font-family:sans-serif;font-size:12px;color:#0f172a;font-weight:600;">
            ${listing.title}
          </div>
        `, {
          permanent: false,
          direction: "top",
          offset: [0, -10],
          opacity: 1,
        });

        // Popup on click
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;padding:4px;">
            <p style="font-weight:700;font-size:14px;margin:0 0 4px;color:#0f172a;">${listing.title}</p>
            <p style="font-size:12px;color:#64748b;margin:0 0 4px;">📍 ${listing.city}${listing.neighborhood ? `, ${listing.neighborhood}` : ""}</p>
            <p style="font-size:15px;font-weight:700;color:#0891b2;margin:0 0 8px;">₪${listing.price.toLocaleString()}<span style="font-size:11px;font-weight:400;color:#94a3b8"> / ${isHe ? "חודש" : "month"}</span></p>
            <a href="/listings/${listing.id}?lang=${lang}" style="display:block;background:#0891b2;color:white;text-align:center;padding:6px 12px;border-radius:100px;text-decoration:none;font-size:12px;font-weight:600;">${isHe ? "לצפייה במודעה" : "View listing"}</a>
          </div>
        `, { maxWidth: 220 });
      });

      if (mappableListings.length > 0) {
        const bounds = mappableListings.map((l) => [l.latitude!, l.longitude!] as [number, number]);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    });

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-gray-200 shadow-sm"
      style={{ height: "420px", zIndex: 0 }}
    >
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      {mappableListings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <p className="text-gray-400 text-sm">{isHe ? "אין מודעות עם כתובת מאומתת" : "No listings with verified addresses yet"}</p>
        </div>
      )}
    </div>
  );
}