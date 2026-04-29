"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import { translations, type Language } from "@/lib/translations";

const cities = ["Tel Aviv", "Ramat Gan", "Herzliya", "Givatayim"];

type Listing = {
  id: number;
  title: string;
  city: string;
  neighborhood: string | null;
  price: number;
  description: string | null;
  start_date: string;
  end_date: string;
};

type Props = {
  listing: Listing;
  lang: Language;
};

export default function EditListingClient({ listing, lang }: Props) {
  const t = translations[lang];
  const isHe = lang === "he";
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState(listing.title);
  const [city, setCity] = useState(listing.city);
  const [neighborhood, setNeighborhood] = useState(listing.neighborhood ?? "");
  const [price, setPrice] = useState(String(listing.price));
  const [description, setDescription] = useState(listing.description ?? "");
  const [startDate, setStartDate] = useState(listing.start_date);
  const [endDate, setEndDate] = useState(listing.end_date);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("listings")
      .update({
        title,
        city,
        neighborhood,
        price: Number(price),
        description,
        start_date: startDate,
        end_date: endDate,
      })
      .eq("id", listing.id);

    if (error) {
      setMessage(isHe ? "העדכון נכשל. נסה שוב." : "Update failed. Please try again.");
    } else {
      router.push(`/my-account?lang=${lang}`);
    }

    setLoading(false);
  }

  return (
    <>
      <PageHeader
        title={isHe ? "עריכת מודעה" : "Edit Listing"}
        lang={lang}
        backHref={`/my-account`}
      />

      <main className="min-h-screen bg-gray-50 px-4 py-8" dir={isHe ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-3xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {isHe ? "כותרת" : "Title"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {isHe ? "עיר" : "City"}
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {isHe ? "שכונה" : "Neighborhood"}
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {isHe ? "מחיר" : "Price"}
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {isHe ? "תיאור" : "Description"}
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {isHe ? "תאריך התחלה" : "Start date"}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {isHe ? "תאריך סיום" : "End date"}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {message && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {loading
                  ? (isHe ? "שומר..." : "Saving...")
                  : (isHe ? "שמור שינויים" : "Save changes")}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/my-account?lang=${lang}`)}
                className="rounded-full border border-gray-300 px-8 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {isHe ? "ביטול" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}