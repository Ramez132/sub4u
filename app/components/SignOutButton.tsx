"use client";

import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-white"
    >
      Sign out
    </button>
  );
}