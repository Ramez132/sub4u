import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import { type Language } from "@/lib/translations";
import dynamic from "next/dynamic";

const SingleListingMap = dynamic(() => import("@/app/components/SingleListingMap"), { ssr: false });

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

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export default async function HandymanProfilePage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const lang: Language = searchParams?.lang === "he" ? "he" : "en";
  const isHe = lang === "he";

  const supabase = await createClient();
  const { data: handyman, error } = await supabase
    .from("handymen")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !handyman) notFound();

  const prof = professions.find((p) => p.value === handyman.profession);

  return (
    <>
      <PageHeader title={handyman.name} lang={lang} backHref={`/handymen?lang=${lang}`} />

      <main className="min-h-screen bg-gray-50 px-4 py-8" dir={isHe ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-2xl space-y-6">

          {/* Profile card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-5 mb-6">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl bg-teal-50 text-5xl shadow-sm">
                {prof?.emoji ?? "🛠️"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{handyman.name}</h1>
                <p className="text-lg font-semibold text-teal-600 mt-1">
                  {isHe ? prof?.he : prof?.en}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  📍 {handyman.city}{handyman.neighborhood ? `, ${handyman.neighborhood}` : ""}
                </p>
              </div>
            </div>

            {handyman.bio && (
              <div className="mb-6">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  {isHe ? "אודות" : "About"}
                </h2>
                <p className="text-gray-600 leading-relaxed">{handyman.bio}</p>
              </div>
            )}

            {/* Contact buttons */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
                {isHe ? "יצירת קשר" : "Contact"}
              </h2>
              <a
                href={`tel:${handyman.phone}`}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                📞 {isHe ? "התקשר" : "Call"} — {handyman.phone}
              </a>
              {handyman.whatsapp && (
                <a
                  href={`https://wa.me/${handyman.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-green-600"
                >
                  💬 WhatsApp — {handyman.whatsapp}
                </a>
              )}
            </div>
          </div>

          {/* Map */}
          {handyman.latitude && handyman.longitude && (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {isHe ? "מיקום" : "Location"}
              </h2>
              <SingleListingMap
                latitude={handyman.latitude}
                longitude={handyman.longitude}
                title={handyman.name}
                lang={lang}
              />
            </div>
          )}

        </div>
      </main>
    </>
  );
}