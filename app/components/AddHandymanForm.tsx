"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const professions = [
  { value: "electrician", emoji: "⚡", label: "Electrician" },
  { value: "plumber", emoji: "🔧", label: "Plumber" },
  { value: "cleaner", emoji: "🧹", label: "Cleaner" },
  { value: "ac", emoji: "❄️", label: "AC Technician" },
  { value: "carpenter", emoji: "🪚", label: "Carpenter" },
  { value: "painter", emoji: "🖌️", label: "Painter" },
  { value: "locksmith", emoji: "🔑", label: "Locksmith" },
  { value: "other", emoji: "🛠️", label: "Other" },
];

const cities = ["Tel Aviv", "Ramat Gan", "Herzliya", "Givatayim"];

export default function AddHandymanForm() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [profession, setProfession] = useState("electrician");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("Tel Aviv");
  const [neighborhood, setNeighborhood] = useState("");
  const [bio, setBio] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Geocode
    let latitude: number | null = null;
    let longitude: number | null = null;
    try {
      const address = [neighborhood, city, "Israel"].filter(Boolean).join(", ");
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const geoData = await geoRes.json();
      if (geoData?.length > 0) {
        latitude = parseFloat(geoData[0].lat);
        longitude = parseFloat(geoData[0].lon);
      }
    } catch {}

    const { error } = await supabase.from("handymen").insert({
      name, profession, phone, whatsapp: whatsapp || null,
      city, neighborhood: neighborhood || null, bio: bio || null,
      latitude, longitude,
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("✅ Handyman added successfully!");
      setName(""); setProfession("electrician"); setPhone("");
      setWhatsapp(""); setCity("Tel Aviv"); setNeighborhood(""); setBio("");
      setTimeout(() => { setOpen(false); setMessage(""); window.location.reload(); }, 1500);
    }
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
      >
        + Add Handyman
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto">
          <div className="my-8 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Add New Handyman</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full rounded-2xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Profession</label>
                <select value={profession} onChange={(e) => setProfession(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500">
                  {professions.map((p) => (
                    <option key={p.value} value={p.value}>{p.emoji} {p.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} required
                    className="w-full rounded-2xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label>
                  <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500">
                    {cities.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Neighborhood</label>
                  <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Bio</label>
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500 resize-none" />
              </div>

              {message && <p className="text-sm text-center text-gray-600">{message}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 rounded-full bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
                  {loading ? "Adding..." : "Add Handyman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}