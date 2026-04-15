import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/app/components/SignOutButton";
import HomeSearch from "@/app/components/HomeSearch";
import { type Language } from "@/lib/translations";
import { translations } from "@/lib/translations";


export default async function Home({
  searchParams,
}: {
  searchParams: { lang?: "en" | "he" };
}) {

  const params = searchParams ? await searchParams : undefined;
  const lang: Language = params?.lang === "he" ? "he" : "en";
  const t = translations[lang];

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date().toISOString();

  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .or(`boost_expires_at.is.null,boost_expires_at.gt.${now}`)
    .order("is_boosted", { ascending: false })
    .order("boost_expires_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load listings:", error);
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="absolute left-0 top-0 z-20 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <a href="/" className="text-2xl font-bold text-white">
            Sub4U
          </a>

          <nav className="flex items-center gap-4">
            <form method="GET">
  <input type="hidden" name="lang" value={lang === "en" ? "he" : "en"} />

  <button
    type="submit"
    className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white"
  >
    {lang === "en" ? "🇮🇱" : "🇺🇸"}
  </button>
</form>
            {user ? (
              <>
                <a
                  href="/my-account"
                  className="rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-white"
                >
                  My Account
                </a>

                <a
                  href="/create-listing"
                  className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Create listing
                </a>

                <SignOutButton />
              </>
            ) : (
              <a
                href="/sign-in"
                className="rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-white"
              >
                Sign in
              </a>
            )}
          </nav>
        </div>
      </header>

      <HomeSearch initialListings={listings ?? []} lang={lang} />
    </main>
  );
}