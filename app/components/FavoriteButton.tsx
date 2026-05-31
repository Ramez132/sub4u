"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  listingId: number;
  lang?: string;
};

export default function FavoriteButton({ listingId, lang = "en" }: Props) {
  const supabase = createClient();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .single();

      setIsFavorited(!!data);
    }
    load();
  }, [listingId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      window.location.href = `/sign-in?lang=${lang}&mode=signin`;
      return;
    }
    setLoading(true);

    if (isFavorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("listing_id", listingId);
      setIsFavorited(false);
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: userId, listing_id: listingId });
      setIsFavorited(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
        isFavorited
          ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-400"
      }`}
      title={isFavorited ? "Remove from favorites" : "Save listing"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}