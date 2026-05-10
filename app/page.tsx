import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/app/components/SignOutButton";
import HomeSearch from "@/app/components/HomeSearch";
import { type Language, translations } from "@/lib/translations";

export const dynamic = "force-dynamic";

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

  // Unread message count — only messages after last_read
  let unreadCount = 0;
  if (user) {
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id, tenant_id, owner_id, tenant_last_read, owner_last_read")
      .or(`tenant_id.eq.${user.id},owner_id.eq.${user.id}`);

    if (conversations && conversations.length > 0) {
      for (const conv of conversations) {
        const isOwner = conv.owner_id === user.id;
        const lastRead = isOwner ? conv.owner_last_read : conv.tenant_last_read;

        let query = supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id);

        if (lastRead) {
          query = query.gt("created_at", lastRead);
        }

        const { count } = await query;
        unreadCount += count ?? 0;
      }
    }
  }

  const now = new Date().toISOString();

  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  const filteredListings = (listings ?? []).map((l) => ({
    ...l,
    is_boosted: l.is_boosted && l.boost_expires_at && new Date(l.boost_expires_at) > new Date() ? true : false,
    boost_expires_at: l.is_boosted && l.boost_expires_at && new Date(l.boost_expires_at) > new Date() ? l.boost_expires_at : null,
  }));

  if (error) console.error("Failed to load listings:", error);

  const listingIds = filteredListings.map((l) => l.id);
  let imagesByListing: Record<number, string[]> = {};

  if (listingIds.length > 0) {
    const { data: images } = await supabase
      .from("listing_images")
      .select("listing_id, image_url, position")
      .in("listing_id", listingIds)
      .order("position", { ascending: true });

    if (images) {
      for (const img of images) {
        if (!imagesByListing[img.listing_id]) imagesByListing[img.listing_id] = [];
        imagesByListing[img.listing_id].push(img.image_url);
      }
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="absolute left-0 top-0 z-20 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          {user ? (
            <a
              href={`/inbox?lang=${lang}`}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow transition hover:bg-white"
              title="Inbox"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </a>
          ) : (
            <div className="h-11 w-11" />
          )}

          <nav className="flex items-center gap-4">
            <div className="flex overflow-hidden rounded-full border border-gray-300 bg-white/90 text-sm font-semibold">
              <form method="GET">
                <input type="hidden" name="lang" value="en" />
                <button type="submit" className={`px-4 py-2 transition ${lang === "en" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}>ENG</button>
              </form>
              <div className="w-px bg-gray-300" />
              <form method="GET">
                <input type="hidden" name="lang" value="he" />
                <button type="submit" className={`px-4 py-2 transition ${lang === "he" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}>עבר</button>
              </form>
            </div>

            {user ? (
              <>
                <a href={`/my-account?lang=${lang}`} className="rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-white">{t.myAccount}</a>
                <a href={`/create-listing?lang=${lang}`} className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">{t.createListing}</a>
                <SignOutButton />
              </>
            ) : (
              <a href={`/sign-in?lang=${lang}&mode=signin`} className="rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-white">{t.signIn}</a>
            )}
          </nav>
        </div>
      </header>

      <HomeSearch initialListings={filteredListings} imagesByListing={imagesByListing} lang={lang} />
    </main>
  );
}