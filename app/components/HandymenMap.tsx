"use client";

import { useEffect, useRef } from "react";

type Handyman = {
  id: string;
  name: string;
  profession: string;
  phone: string;
  city: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Props = {
  handymen: Handyman[];
  lang: "en" | "he";
  onSelect?: (id: string) => void;
};

const professionColors: Record<string, string> = {
  electrician: "#f59e0b",
  plumber: "#3b82f6",
  cleaner: "#10b981",
  ac: "#06b6d4",
  carpenter: "#8b5cf6",
  painter: "#ec4899",
  locksmith: "#f97316",
  other: "#6b7280",
};

const DEFAULT_CENTER: [number, number] = [32.0879, 34.8296];

export default function HandymenMap({ handymen, lang, onSelect }: Props) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHe = lang === "he";
  const mappable = handymen.filter((h) => h.latitude && h.longitude);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(containerRef.current!, { center: DEFAULT_CENTER, zoom: 12, dragging: true });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mappable.forEach((handyman) => {
        const color = professionColors[handyman.profession] ?? professionColors.other;

        const icon = L.divIcon({
          html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;"></div>`,
          className: "",
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          popupAnchor: [0, -12],
        });

        const marker = L.marker([handyman.latitude!, handyman.longitude!], { icon }).addTo(map);

        marker.bindTooltip(`<div style="font-family:sans-serif;font-weight:700;font-size:12px;">${handyman.name}</div><div style="font-size:11px;color:#64748b;">${handyman.profession}</div>`, {
          permanent: false, direction: "top", offset: [0, -8], opacity: 1,
        });

        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:160px;padding:4px;">
            <p style="font-weight:700;font-size:14px;margin:0 0 2px;color:#0f172a;">${handyman.name}</p>
            <p style="font-size:12px;color:#64748b;margin:0 0 6px;">📍 ${handyman.city}${handyman.neighborhood ? `, ${handyman.neighborhood}` : ""}</p>
            <a href="/handymen/${handyman.id}?lang=${lang}" style="display:block;background:#0891b2;color:white;text-align:center;padding:6px 12px;border-radius:100px;text-decoration:none;font-size:12px;font-weight:600;">${isHe ? "צפה בפרטים" : "View profile"}</a>
          </div>
        `, { maxWidth: 200 });
      });

      if (mappable.length > 0) {
        const bounds = mappable.map((h) => [h.latitude!, h.longitude!] as [number, number]);
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
    <div className="relative w-full overflow-hidden rounded-3xl border border-gray-200 shadow-sm" style={{ height: "380px", zIndex: 0 }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      {mappable.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <p className="text-gray-400 text-sm">{isHe ? "אין בעלי מקצוע עם מיקום" : "No handymen with location"}</p>
        </div>
      )}
    </div>
  );
}