import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import { translations, type Language } from "@/lib/translations";
import StartConversationButton from "@/app/components/StartConversationButton";
import ListingGallery from "@/app/components/ListingGallery";
import SingleListingMap from "@/app/components/SingleListingMap";
import FavoriteButton from "@/app/components/FavoriteButton";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string; from?: string }>;
};

async function translateText(text: string, targetLang: Language): Promise<string> {
  if (targetLang === "en") return text;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `Translate the following apartment listing description to Hebrew. Return only the translated text, nothing else:\n\n${text}`,
        }],
      }),
    });
    const data = await response.json();
    return data?.content?.[0]?.text ?? text;
  } catch {
    return text;
  }
}

export default async function ListingPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const id = params.id;
  const lang: Language = searchParams?.lang === "he" ? "he" : "en";
  const from = searchParams?.from === "account" ? "/my-account" : "/";
  const t = translations[lang];
  const isHe = lang === "he";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !listing) notFound();

  // Fetch images
  const { data: images } = await supabase
    .from("listing_images")
    .select("image_url, position")
    .eq("listing_id", id)
    .order("position", { ascending: true });

  const imageUrls = images?.map((img) => img.image_url) ?? [];

  const isOwner = user?.id === listing.user_id;

  let existingConversationId: string | null = null;
  if (user && !isOwner) {
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listing.id)
      .eq("tenant_id", user.id)
      .single();
    existingConversationId = existing?.id ?? null;
  }

  const description = listing.description
    ? await translateText(listing.description, lang)
    : null;

  // Format dates nicely
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(isHe ? "he-IL" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-[#F8F7F4]" dir={isHe ? "rtl" : "ltr"}>
      <PageHeader title="" lang={lang} backHref={from} />

      {/* Image gallery */}
      <ListingGallery images={imageUrls} title={listing.title} />

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Left: main info */}
          <div className="lg:col-span-2">
            {/* Title + location */}
            <div className="mb-6">
              {listing.is_boosted && (
                <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  ⚡ {isHe ? "ממומן" : "Featured"}
                </span>
              )}
              <h1 className="mb-2 text-3xl font-bold leading-tight text-gray-900">
                {listing.title}
              </h1>
              <p className="flex items-center gap-2 text-base text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.013 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.314 3.5 8.327a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742z" clipRule="evenodd" />
                </svg>
                {listing.city}{listing.neighborhood ? `, ${listing.neighborhood}` : ""}
              </p>
            </div>

            {/* Divider */}
            <hr className="mb-6 border-gray-200" />

            {/* Dates */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t.availableFrom}
                </p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(listing.start_date)}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t.availableUntil}
                </p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(listing.end_date)}</p>
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">{t.description}</h2>
                <p className="leading-relaxed text-gray-600">{description}</p>
              </div>
            )}

            {/* Transportation */}
            {listing.transportation && listing.transportation.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  {isHe ? "כלי תחבורה כלולים" : "Included transportation"}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {listing.transportation.map((item: { value: string; free: boolean; price: string }) => {
                    const map: Record<string, { emoji: string; en: string; he: string }> = {
                      bicycle: { emoji: "🚲", en: "Bicycle", he: "אופניים" },
                      car: { emoji: "🚗", en: "Car", he: "אוטו" },
                      scooter: { emoji: "🛴", en: "Scooter", he: "קורקינט" },
                    };
                    const t = map[item.value];
                    if (!t) return null;

                    // Calculate monthly price if span > 1 month
                    let priceDisplay = "";
                    if (!item.free && item.price) {
                      const start = new Date(listing.start_date);
                      const end = new Date(listing.end_date);
                      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                      const totalPrice = Number(item.price);

                      if (days > 30) {
                        const months = days / 30;
                        const perMonth = Math.round(totalPrice / months);
                        priceDisplay = isHe ? `₪${perMonth.toLocaleString()} לחודש` : `₪${perMonth.toLocaleString()} / month`;
                      } else {
                        priceDisplay = `₪${totalPrice.toLocaleString()}`;
                      }
                    }

                    return (
                      <div key={item.value} className="flex items-center gap-2 rounded-2xl border-2 border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">
                        <span className="text-xl">{t.emoji}</span>
                        <span>{isHe ? t.he : t.en}</span>
                        {item.free ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                            {isHe ? "חינם ✓" : "Free ✓"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800">
                            {priceDisplay}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Map */}
            {listing.latitude && listing.longitude && (
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  {isHe ? "מיקום" : "Location"}
                </h2>
                <SingleListingMap
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  title={listing.title}
                  lang={lang}
                />
              </div>
            )}
          </div>

          {/* Right: price card + CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-md">
              <div className="mb-4 text-center">
                <span className="text-4xl font-bold text-gray-900">₪{listing.price.toLocaleString()}</span>
                <span className="ml-1 text-sm text-gray-400">{isHe ? "/ חודש" : "/ month"}</span>
              </div>

              {!isOwner && (
                <div className="mb-4 flex justify-center">
                  <FavoriteButton listingId={listing.id} lang={lang} />
                </div>
              )}

              <hr className="mb-4 border-gray-100" />

              <div className="mb-5 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>{t.city}</span>
                  <span className="font-medium text-gray-900">{listing.city}</span>
                </div>
                {listing.neighborhood && (
                  <div className="flex justify-between">
                    <span>{isHe ? "שכונה" : "Neighborhood"}</span>
                    <span className="font-medium text-gray-900">{listing.neighborhood}</span>
                  </div>
                )}
              </div>

              {/* Message / sign in CTA */}
              {user && !isOwner && (
                <div className="w-full">
                  {existingConversationId ? (
                    <a
                      href={`/inbox/${existingConversationId}?lang=${lang}`}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {isHe ? "המשך שיחה" : "Continue conversation"}
                    </a>
                  ) : (
                    <StartConversationButton listingId={listing.id} ownerId={listing.user_id} lang={lang} />
                  )}
                </div>
              )}

              {!user && (
                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
                  {isHe ? "התחבר כדי לשלוח הודעה" : "Sign in to message the renter"}{" "}
                  <a href={`/sign-in?lang=${lang}&mode=signin`} className="font-semibold text-blue-600 hover:underline">
                    {isHe ? "התחברות" : "Sign in"}
                  </a>
                </div>
              )}

              {isOwner && (
                <div className="rounded-2xl bg-orange-50 px-4 py-3 text-center text-sm font-medium text-blue-600">
                  {isHe ? "זו המודעה שלך" : "This is your listing"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}