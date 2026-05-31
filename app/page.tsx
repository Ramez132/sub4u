import { createClient } from "@/lib/supabase/server";
import HomeSearch from "@/app/components/HomeSearch";
import HamburgerMenu from "@/app/components/HamburgerMenu";
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
  const isHe = lang === "he";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unread message count
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

  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
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
          {/* Left side: inbox when signed in, logo when signed out */}
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
            <a href="/" className="text-2xl font-bold text-white drop-shadow">Sub4U</a>
          )}

          {/* Right side: hamburger menu */}
          <HamburgerMenu
            lang={lang}
            isHe={isHe}
            user={user}
            unreadCount={unreadCount}
            myAccount={t.myAccount}
            createListing={t.createListing}
            signIn={t.signIn}
          />
        </div>
      </header>

      <HomeSearch initialListings={filteredListings} imagesByListing={imagesByListing} lang={lang} />
    </main>
  );
}