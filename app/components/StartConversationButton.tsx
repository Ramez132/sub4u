"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { type Language } from "@/lib/translations";

type Props = {
  listingId: number;
  ownerId: string;
  lang: Language;
};

export default function StartConversationButton({ listingId, ownerId, lang }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isHe = lang === "he";

  async function handleStart() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create conversation
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        listing_id: listingId,
        tenant_id: user.id,
        owner_id: ownerId,
      })
      .select("id")
      .single();

    if (error || !data) {
      setLoading(false);
      return;
    }

    router.push(`/inbox/${data.id}?lang=${lang}`);
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      {loading
        ? (isHe ? "..." : "...")
        : (isHe ? "שלח הודעה למשכיר" : "Message the renter")}
    </button>
  );
}