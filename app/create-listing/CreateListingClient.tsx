"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/app/components/PageHeader";
import { translations, type Language } from "@/lib/translations";

const cities = ["Tel Aviv", "Ramat Gan", "Herzliya", "Givatayim"];

type Props = {
  lang: Language;
};

export default function CreateListingClient({ lang }: Props) {
  const t = translations[lang];
  const isHe = lang === "he";

  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [city, setCity] = useState(cities[0]);
  const [neighborhood, setNeighborhood] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [transportation, setTransportation] = useState<{ value: string; free: boolean; price: string }[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (files.length < 4) {
      setImageError(isHe ? "יש להעלות לפחות 4 תמונות." : "You must upload at least 4 images.");
    } else if (files.length > 10) {
      setImageError(isHe ? "ניתן להעלות עד 10 תמונות בלבד." : "You can upload up to 10 images only.");
    } else {
      setImageError("");
    }

    setSelectedFiles(files);
  }

  const previewUrls = useMemo(() => {
    return selectedFiles.map((file) => URL.createObjectURL(file));
  }, [selectedFiles]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage("");

    if (selectedFiles.length < 4) {
      setImageError(isHe ? "יש להעלות לפחות 4 תמונות." : "You must upload at least 4 images.");
      return;
    }

    if (selectedFiles.length > 10) {
      setImageError(isHe ? "ניתן להעלות עד 10 תמונות בלבד." : "You can upload up to 10 images only.");
      return;
    }

    setImageError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFormMessage(isHe ? "יש להתחבר כדי לפרסם מודעה." : "You must be signed in.");
      setLoading(false);
      return;
    }

    // Geocode the address using OpenStreetMap Nominatim
    let latitude: number | null = null;
    let longitude: number | null = null;
    let geocodeWarning = "";

    try {
      const address = [neighborhood, city, "Israel"].filter(Boolean).join(", ");
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        latitude = parseFloat(geoData[0].lat);
        longitude = parseFloat(geoData[0].lon);
      } else {
        geocodeWarning = isHe
          ? "הכתובת לא נמצאה במפה. המודעה תפורסם אך לא תופיע על המפה."
          : "Address not found on map. Listing will be published but won't appear on the map.";
      }
    } catch {
      geocodeWarning = isHe
        ? "לא ניתן לאמת את הכתובת. המודעה תפורסם אך לא תופיע על המפה."
        : "Could not verify address. Listing will be published but won't appear on the map.";
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert({
        user_id: user.id,
        title,
        city,
        neighborhood,
        price: Number(price),
        description,
        start_date: startDate,
        end_date: endDate,
        latitude,
        longitude,
        transportation,
      })
      .select()
      .single();

    if (listingError || !listing) {
      setFormMessage(isHe ? "יצירת המודעה נכשלה." : "Failed to create listing.");
      setLoading(false);
      return;
    }

    const uploadedImageRows = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${listing.id}/${Date.now()}-${i}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) {
        setFormMessage(isHe ? "המודעה נוצרה, אך העלאת התמונות נכשלה." : "Listing created, but image upload failed.");
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);

      uploadedImageRows.push({
        listing_id: listing.id,
        image_url: publicUrlData.publicUrl,
        position: i + 1,
      });
    }

    const { error: imagesError } = await supabase
      .from("listing_images")
      .insert(uploadedImageRows);

    if (imagesError) {
      setFormMessage(isHe ? "המודעה נוצרה, אך שמירת התמונות נכשלה." : "Listing created, but failed to save image records.");
      setLoading(false);
      return;
    }

    setLoading(false);
    if (geocodeWarning) {
      setFormMessage(geocodeWarning);
      setTimeout(() => router.push(`/my-account?lang=${lang}`), 3000);
    } else {
      router.push(`/my-account?lang=${lang}`);
    }
    setTitle("");
    setCity(cities[0]);
    setNeighborhood("");
    setPrice("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setSelectedFiles([]);
    setTransportation([]);
  }

  return (
    <>
      <PageHeader title={t.createListingTitle} lang={lang} backHref="/" />

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
                placeholder={isHe ? "לדוג׳: סאבלט שמשי ליד דיזנגוף" : "e.g. Sunny sublet near Dizengoff"}
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
                {cities.map((cityOption) => (
                  <option key={cityOption} value={cityOption}>
                    {cityOption}
                  </option>
                ))}
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
                placeholder={isHe ? "לדוג׳: פלורנטין" : "e.g. Florentin"}
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
                placeholder={isHe ? "לדוג׳: 4500" : "e.g. 4500"}
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
                placeholder={isHe ? "תאר את הדירה..." : "Describe the apartment..."}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                {isHe ? "כלי תחבורה כלולים" : "Included transportation"}
              </label>
              <div className="space-y-3">
                {[
                  { value: "bicycle", emoji: "🚲", en: "Bicycle", he: "אופניים" },
                  { value: "car", emoji: "🚗", en: "Car", he: "אוטו" },
                  { value: "scooter", emoji: "🛴", en: "Scooter", he: "קורקינט" },
                ].map((item) => {
                  const existing = transportation.find((t) => t.value === item.value);
                  const checked = !!existing;
                  return (
                    <div key={item.value} className={`rounded-2xl border-2 transition-all ${checked ? "border-teal-500 bg-teal-50" : "border-gray-200 bg-white"}`}>
                      {/* Checkbox row */}
                      <label className="flex cursor-pointer items-center gap-3 px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-teal-600"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTransportation((prev) => [...prev, { value: item.value, free: true, price: "" }]);
                            } else {
                              setTransportation((prev) => prev.filter((t) => t.value !== item.value));
                            }
                          }}
                        />
                        <span className="text-2xl">{item.emoji}</span>
                        <span className="font-semibold text-gray-800">{isHe ? item.he : item.en}</span>
                      </label>

                      {/* Pricing options — shown when checked */}
                      {checked && (
                        <div className="border-t border-teal-100 px-4 pb-4 pt-3">
                          <div className="flex gap-3 mb-3">
                            <button
                              type="button"
                              onClick={() => setTransportation((prev) => prev.map((t) => t.value === item.value ? { ...t, free: true, price: "" } : t))}
                              className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${existing?.free ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                              {isHe ? "✓ חינם" : "✓ Free"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setTransportation((prev) => prev.map((t) => t.value === item.value ? { ...t, free: false } : t))}
                              className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${!existing?.free ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                              {isHe ? "₪ בתשלום" : "₪ Paid"}
                            </button>
                          </div>

                          {!existing?.free && (
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-500">
                                {isHe ? "מחיר לכל תקופת הסאבלט (₪)" : "Total price for the entire sublet period (₪)"}
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={existing?.price ?? ""}
                                onChange={(e) => setTransportation((prev) => prev.map((t) => t.value === item.value ? { ...t, price: e.target.value } : t))}
                                placeholder={isHe ? "לדוג׳: 200" : "e.g. 200"}
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {isHe ? "תמונות המודעה" : "Listing images"}
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                className="block w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700"
              />

              <p className="mt-2 text-sm text-gray-500">
                {isHe ? "העלה בין 4 ל-10 תמונות." : "Upload between 4 and 10 images."}
              </p>

              <p className="mt-2 text-sm font-medium text-gray-700">
                {isHe ? `תמונות נבחרו: ${selectedFiles.length}` : `Selected images: ${selectedFiles.length}`}
              </p>

              {imageError && (
                <div className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {imageError}
                </div>
              )}

              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {formMessage && (
              <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-700">
                {formMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading
                ? isHe ? "יוצר מודעה..." : "Creating..."
                : isHe ? "פרסם מודעה" : "Create listing"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}