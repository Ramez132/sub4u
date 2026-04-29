import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import { translations, type Language } from "@/lib/translations";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function InboxPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const lang: Language = searchParams?.lang === "he" ? "he" : "en";
  const t = translations[lang];
  const isHe = lang === "he";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?lang=${lang}&mode=signin`);

  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      id,
      listing_id,
      tenant_id,
      owner_id,
      created_at,
      listings ( title, city ),
      messages ( content, created_at, sender_id )
    `)
    .or(`tenant_id.eq.${user.id},owner_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // Fetch profiles for all other users in conversations
  const otherUserIds = (conversations ?? []).map((conv) =>
    conv.owner_id === user.id ? conv.tenant_id : conv.owner_id
  );

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", otherUserIds.length > 0 ? otherUserIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (
    <main className="min-h-screen bg-gray-50" dir={isHe ? "rtl" : "ltr"}>
      <PageHeader title={t.inbox} lang={lang} backHref="/" />

      <div className="mx-auto max-w-2xl px-4 py-8">
        {!conversations || conversations.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-900">{t.noMessages}</p>
            <p className="mt-1 text-sm text-gray-500">{t.noMessagesDesc}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const listing = (Array.isArray(conv.listings) ? conv.listings[0] : conv.listings) as { title: string; city: string } | null;
              const allMessages = (conv.messages ?? []) as { content: string; created_at: string; sender_id: string }[];
              const lastMessage = allMessages.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )[0];
              const isOwner = conv.owner_id === user.id;
              const otherUserId = isOwner ? conv.tenant_id : conv.owner_id;
              const otherUserName = profileMap[otherUserId] || (isHe ? "משתמש" : "User");

              return (
                <a
                  key={conv.id}
                  href={`/inbox/${conv.id}?lang=${lang}`}
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                >
                  {/* Avatar with initials */}
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                    {otherUserName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Other person's name */}
                    <p className="truncate font-semibold text-gray-900">
                      {otherUserName}
                    </p>
                    {/* Listing title */}
                    <p className="truncate text-sm text-gray-500">
                      {listing?.title ?? (isHe ? "מודעה" : "Listing")}
                      {isOwner
                        ? (isHe ? " · שוכר פוטנציאלי" : " · Potential tenant")
                        : (isHe ? " · משכיר" : " · Renter")}
                    </p>
                    {lastMessage && (
                      <p className="mt-1 truncate text-sm text-gray-400">
                        {lastMessage.sender_id === user.id ? t.you : ""}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>

                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}