"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import { translations, type Language } from "@/lib/translations";

function SignInInner() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const lang: Language = searchParams.get("lang") === "he" ? "he" : "en";
  const t = translations[lang];

  const [mode, setMode] = useState<"signup" | "signin">(
    searchParams.get("mode") === "signin" ? "signin" : "signup"
  );

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  async function handleSignUp() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password: crypto.randomUUID() + "Aa1!",
      options: {
        emailRedirectTo: "https://sub4u.vercel.app",
        data: { full_name: fullName, phone_number: phoneNumber, id_number: idNumber },
      },
    });

    if (error) { setMessage(error.message); setLoading(false); return; }

    const userId = data.user?.id;
    if (!userId) {
      setMessage(t.accountCreated);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId, email, full_name: fullName, phone_number: phoneNumber, id_number: idNumber,
    });

    setMessage(profileError ? t.accountCreatedProfileFailed : t.accountCreated);
    setLoading(false);
  }

  async function sendOtpCode() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: otpEmail,
      options: { shouldCreateUser: false, emailRedirectTo: "https://sub4u.vercel.app" },
    });
    if (error) { setMessage(error.message); } else { setOtpSent(true); setMessage(t.pinSent); }
    setLoading(false);
  }

  async function verifyOtpCode() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.verifyOtp({ email: otpEmail, token: otpCode, type: "email" });
    if (error) { setMessage(error.message); } else { setMessage(t.signedInSuccess); window.location.href = "/"; }
    setLoading(false);
  }

  return (
    <>
      <PageHeader
        title={mode === "signup" ? t.createAccount : t.signIn}
        lang={lang}
        backHref="/"
      />

      <main className="min-h-screen bg-white px-4 py-12" dir={lang === "he" ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex gap-3">
            <button type="button" onClick={() => { setMode("signup"); setMessage(""); }}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${mode === "signup" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
              {t.signUp}
            </button>
            <button type="button" onClick={() => { setMode("signin"); setMessage(""); }}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${mode === "signin" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
              {t.signIn}
            </button>
          </div>

          {mode === "signup" ? (
            <div className="space-y-5">
              <h1 className="text-3xl font-bold text-gray-900">{t.createAccount}</h1>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t.email}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t.fullName}</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t.fullName}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t.phoneNumber}</label>
                <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="0501234567"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t.idNumber}</label>
                <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder={t.idNumber}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500" />
              </div>
              {message && <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-700">{message}</div>}
              <button type="button" onClick={handleSignUp} disabled={loading}
                className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">
                {loading ? t.pleaseWait : t.createAccount}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <h1 className="text-3xl font-bold text-gray-900">{t.signIn}</h1>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t.email}</label>
                <input type="email" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500" />
              </div>
              {otpSent && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">{t.pinCode}</label>
                  <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder={t.enterPinCode}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500" />
                </div>
              )}
              {message && <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-700">{message}</div>}
              {!otpSent ? (
                <button type="button" onClick={sendOtpCode} disabled={loading}
                  className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">
                  {loading ? t.pleaseWait : t.sendPinCode}
                </button>
              ) : (
                <button type="button" onClick={verifyOtpCode} disabled={loading}
                  className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">
                  {loading ? t.pleaseWait : t.verifyPinCode}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInInner />
    </Suspense>
  );
}