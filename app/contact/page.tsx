"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import { translations, type Language } from "@/lib/translations";

function ContactInner() {
  const searchParams = useSearchParams();
  const lang: Language = searchParams.get("lang") === "he" ? "he" : "en";
  const t = translations[lang];
  const isHe = lang === "he";

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message }),
    });

    if (res.ok) {
      setSent(true);
    } else {
      setError(isHe ? "שליחה נכשלה. נסה שוב." : "Failed to send. Please try again.");
    }

    setLoading(false);
  }

  return (
    <>
      <PageHeader
        title={isHe ? "צור קשר" : "Contact Us"}
        lang={lang}
        backHref="/"
      />

      <main className="min-h-screen bg-gray-50 px-4 py-12" dir={isHe ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-lg">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

            {sent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isHe ? "הודעתך נשלחה!" : "Message sent!"}
                </h2>
                <p className="text-gray-500">
                  {isHe ? "נחזור אליך בהקדם." : "We'll get back to you shortly."}
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {isHe ? "צור קשר" : "Contact Us"}
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                  {isHe
                    ? "יש לך שאלה? נשמח לעזור."
                    : "Have a question? We'd love to help."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {isHe ? "אימייל" : "Email"}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {isHe ? "הודעה" : "Message"}
                    </label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={isHe ? "כתוב את הודעתך כאן..." : "Write your message here..."}
                      required
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 resize-none"
                    />
                  </div>

                  {error && (
                    <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
                  >
                    {loading
                      ? (isHe ? "שולח..." : "Sending...")
                      : (isHe ? "שלח הודעה" : "Send message")}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactInner />
    </Suspense>
  );
}