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
          {/* Logo */}
          <a href="/" className="text-2xl font-bold text-white drop-shadow">Sub4U</a>

          {/* Hamburger menu */}
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