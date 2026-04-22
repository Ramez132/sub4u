"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { translations, type Language } from "@/lib/translations";
import PageHeader from "@/app/components/PageHeader";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

type Props = {
  params: { id: string };
};

export default function ConversationPage({ params }: Props) {
  const conversationId = params.id;
  const searchParams = useSearchParams();
  const lang: Language = searchParams.get("lang") === "he" ? "he" : "en";
  const isHe = lang === "he";

  const supabase = createClient();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [listingTitle, setListingTitle] = useState("");

  // Load user + conversation info
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push(`/sign-in?lang=${lang}&mode=signin`); return; }
      setUserId(user.id);

      // Load conversation + listing title
      const { data: conv } = await supabase
        .from("conversations")
        .select("listings ( title )")
        .eq("id", conversationId)
        .single();

      const listing = (Array.isArray(conv?.listings) ? conv.listings[0] : conv?.listings) as { title: string } | null;
      if (listing?.title) setListingTitle(listing.title);

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

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!newMessage.trim() || !userId) return;
    setSending(true);

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: newMessage.trim(),
    });

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
        title={listingTitle || (isHe ? "שיחה" : "Conversation")}
        lang={lang}
        backHref="/inbox"
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-gray-400">
              {isHe ? "התחל את השיחה 👋" : "Start the conversation 👋"}
            </p>
          )}

          {messages.map((msg) => {
            const isMine = msg.sender_id === userId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isMine
                      ? "rounded-br-sm bg-orange-500 text-white"
                      : "rounded-bl-sm bg-white border border-gray-200 text-gray-900"
                  }`}
                >
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

      {/* Input bar */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isHe ? "כתוב הודעה..." : "Type a message..."}
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