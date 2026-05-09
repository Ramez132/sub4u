"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/app/components/PageHeader";
import { translations, type Language } from "@/lib/translations";
import { useRouter } from "next/navigation";

const router = useRouter();

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
    router.push(`/my-account?lang=${lang}`);
    setTitle("");
    setCity(cities[0]);
    setNeighborhood("");
    setPrice("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setSelectedFiles([]);
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
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500"
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
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500"
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
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500"
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
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500"
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
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500"
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
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500"
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
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500"
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
                className="block w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:font-semibold file:text-teal-700"
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
              className="rounded-full bg-teal-600 px-8 py-4 text-base font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
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