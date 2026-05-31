"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/app/components/PageHeader";
import { type Language } from "@/lib/translations";
import dynamic from "next/dynamic";

const HandymenMap = dynamic(() => import("@/app/components/HandymenMap"), { ssr: false });

type Handyman = {
  id: string;
  name: string;
  profession: string;
  phone: string;
  whatsapp: string | null;
  city: string;
  neighborhood: string | null;
  bio: string | null;
  latitude: number | null;
  longitude: number | null;
};

const professions = [
  { value: "electrician", emoji: "⚡", en: "Electrician", he: "חשמלאי" },
  { value: "plumber", emoji: "🔧", en: "Plumber", he: "שרברב" },
  { value: "cleaner", emoji: "🧹", en: "Cleaner", he: "מנקה" },
  { value: "ac", emoji: "❄️", en: "AC Technician", he: "טכנאי מזגן" },
  { value: "carpenter", emoji: "🪚", en: "Carpenter", he: "נגר" },
  { value: "painter", emoji: "🖌️", en: "Painter", he: "צבעי" },
  { value: "locksmith", emoji: "🔑", en: "Locksmith", he: "מנעולן" },
  { value: "other", emoji: "🛠️", en: "Other", he: "אחר" },
];

const cities = ["All", "Tel Aviv", "Ramat Gan", "Herzliya", "Givatayim"];

function getProfession(value: string) {
  return professions.find((p) => p.value === value);
}

function HandymenInner() {
  const searchParams = useSearchParams();
  const lang: Language = searchParams.get("lang") === "he" ? "he" : "en";
  const isHe = lang === "he";
  const supabase = createClient();

  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] = useState("all");
  const [selectedCity, setSelectedCity] = useState("All");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("handymen").select("*").order("created_at", { ascending: false });
      setHandymen(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = handymen.filter((h) => {
    const profMatch = selectedProfession === "all" || h.profession === selectedProfession;
    const cityMatch = selectedCity === "All" || h.city === selectedCity;
    return profMatch && cityMatch;
  });

  return (
    <>
      <PageHeader title={isHe ? "בעלי מקצוע" : "Handymen"} lang={lang} backHref="/" />

      <main className="min-h-screen bg-gray-50" dir={isHe ? "rtl" : "ltr"}>

        {/* Hero */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 py-12 text-center text-white">
          <div className="text-4xl mb-3">🛠️</div>
          <h1 className="text-3xl font-bold mb-2">{isHe ? "בעלי מקצוע מוסמכים" : "Trusted Handymen"}</h1>
          <p className="text-teal-100 max-w-xl mx-auto">
            {isHe
              ? "מצא את בעל המקצוע המתאים עבורך — חשמלאים, שרברבים, מנקים ועוד"
              : "Find the right professional for you — electricians, plumbers, cleaners and more"}
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">

          {/* Filters */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
            <div className="mb-4">
              <p className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {isHe ? "סנן לפי מקצוע" : "Filter by profession"}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedProfession("all")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedProfession === "all" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {isHe ? "הכל" : "All"}
                </button>
                {professions.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setSelectedProfession(p.value)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${selectedProfession === p.value ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    <span>{p.emoji}</span>
                    {isHe ? p.he : p.en}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {isHe ? "סנן לפי עיר" : "Filter by city"}
              </p>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCity === city ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {city === "All" ? (isHe ? "הכל" : "All") : city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {isHe ? "מפת בעלי המקצוע" : "Handymen map"}
            </h2>
            <HandymenMap handymen={filtered} lang={lang} />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {professions.map((p) => (
              <div key={p.value} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>{p.emoji}</span>
                {isHe ? p.he : p.en}
              </div>
            ))}
          </div>

          {/* Cards */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {isHe ? "בעלי מקצוע זמינים" : "Available professionals"}
              </h2>
              <p className="text-sm text-gray-500">{filtered.length} {isHe ? "נמצאו" : "found"}</p>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="animate-pulse rounded-3xl bg-gray-100 h-48" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-500">{isHe ? "לא נמצאו בעלי מקצוע" : "No handymen found"}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((handyman) => {
                  const prof = getProfession(handyman.profession);
                  return (
                    <a
                      key={handyman.id}
                      href={`/handymen/${handyman.id}?lang=${lang}`}
                      className="flex flex-col rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-3xl">
                          {prof?.emoji ?? "🛠️"}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{handyman.name}</h3>
                          <p className="text-sm font-medium text-teal-600">
                            {isHe ? prof?.he : prof?.en}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <p className="text-sm text-gray-500 mb-2">
                        📍 {handyman.city}{handyman.neighborhood ? `, ${handyman.neighborhood}` : ""}
                      </p>

                      {/* Bio */}
                      {handyman.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{handyman.bio}</p>
                      )}

                      {/* Contact */}
                      <div className="mt-auto flex gap-2">
                        <span className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                          📞 {handyman.phone}
                        </span>
                        {handyman.whatsapp && (
                          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                            💬 WhatsApp
                          </span>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function HandymenPage() {
  return (
    <Suspense>
      <HandymenInner />
    </Suspense>
  );
}