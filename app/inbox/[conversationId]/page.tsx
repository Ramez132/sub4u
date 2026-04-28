"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { translations, type Language } from "@/lib/translations";
import PageHeader from "@/app/components/PageHeader";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

function ConversationInner() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const searchParams = useSearchParams();
  const lang: Language = searchParams.get("lang") === "he" ? "he" : "en";
  const t = translations[lang];
  const isHe = lang === "he";

  const supabase = createClient();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [listingTitle, setListingTitle] = useState("");
  const [otherUserName, setOtherUserName] = useState("");
  const [otherUserEmail, setOtherUserEmail] = useState("");
  const [myName, setMyName] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push(`/sign-in?lang=${lang}&mode=signin`); return; }
      setUserId(user.id);

      // Load conversation + listing
      const { data: conv } = await supabase
        .from("conversations")
        .select("tenant_id, owner_id, listings ( title )")
        .eq("id", conversationId)
        .single();

      if (!conv) return;

      const listing = (Array.isArray(conv.listings) ? conv.listings[0] : conv.listings) as { title: string } | null;
      if (listing?.title) setListingTitle(listing.title);

      // Figure out who the other user is
      const otherUserId = conv.owner_id === user.id ? conv.tenant_id : conv.owner_id;

      // Load both profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", [user.id, otherUserId]);

      const myProfile = profiles?.find((p) => p.id === user.id);
      const otherProfile = profiles?.find((p) => p.id === otherUserId);

      setMyName(myProfile?.full_name || "");
      setOtherUserName(otherProfile?.full_name || (isHe ? "משתמש" : "User"));
      setOtherUserEmail(otherProfile?.email || "");

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      setMessages(msgs ?? []);
    }
    load();
  }, [conversationId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!newMessage.trim() || !userId) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: newMessage.trim(),
    });

    if (!error && otherUserEmail) {
      // Send email notification
      await fetch("/api/notify-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: otherUserEmail,
          toName: otherUserName,
          fromName: myName,
          listingTitle,
          message: newMessage.trim(),
          conversationId,
        }),
      });
    }

    setNewMessage("");
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString(isHe ? "he-IL" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex h-screen flex-col" dir={isHe ? "rtl" : "ltr"}>
      <PageHeader
        title={otherUserName || listingTitle || t.conversation}
        lang={lang}
        backHref="/inbox"
      />

      {/* Listing subtitle */}
      {listingTitle && (
        <div className="border-b border-gray-100 bg-white px-4 py-2 text-center text-xs text-gray-400">
          {isHe ? "בנוגע ל: " : "Re: "}{listingTitle}
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-gray-400">{t.startConversation}</p>
          )}

          {messages.map((msg) => {
            const isMine = msg.sender_id === userId;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                {!isMine && (
                  <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                    {otherUserName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isMine
                    ? "rounded-br-sm bg-orange-500 text-white"
                    : "rounded-bl-sm border border-gray-200 bg-white text-gray-900"
                }`}>
                  {!isMine && (
                    <p className="mb-1 text-xs font-semibold text-orange-500">{otherUserName}</p>
                  )}
                  <p>{msg.content}</p>
                  <p className={`mt-1 text-right text-xs ${isMine ? "text-orange-200" : "text-gray-400"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.typeMessage}
            className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
          />
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConversationPage() {
  return (
    <Suspense>
      <ConversationInner />
    </Suspense>
  );
}