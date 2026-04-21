import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import { translations, type Language } from "@/lib/translations";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
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
        messages: [
          {
            role: "user",
            content: `Translate the following apartment listing description to Hebrew. Return only the translated text, nothing else:\n\n${text}`,
          },
        ],
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
  const t = translations[lang];
  const isHe = lang === "he";

  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const description = listing.description
    ? await translateText(listing.description, lang)
    : null;

  return (
    <main className="min-h-screen bg-white" dir={isHe ? "rtl" : "ltr"}>
      <PageHeader title={t.listingDetail} lang={lang} />

      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-3xl font-bold">{listing.title}</h1>

        <p className="mb-2 text-lg text-gray-700">
          📍 {t.locationLabel}: {listing.city}
          {listing.neighborhood ? `, ${listing.neighborhood}` : ""}
        </p>

        <p className="mb-2 text-lg text-gray-700">
          💰 {t.priceLabel}: ₪{listing.price}
        </p>

        <p className="mb-2 text-lg text-gray-700">
          📅 {t.availableFrom}: {listing.start_date}
        </p>

        <p className="mb-6 text-lg text-gray-700">
          📅 {t.availableUntil}: {listing.end_date}
        </p>

        {description && (
          <div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              {t.description}
            </h2>
            <p className="text-gray-800 leading-relaxed">{description}</p>
          </div>
        )}
      </div>
    </main>
  );
}