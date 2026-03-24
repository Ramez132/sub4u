"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const supabase = createClient();

  const [mode, setMode] = useState<"signup" | "signin">("signup");

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
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          id_number: idNumber,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      setMessage("Account created. Please check your email to confirm.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email,
      full_name: fullName,
      phone_number: phoneNumber,
      id_number: idNumber,
    });

    if (profileError) {
      setMessage("Account created, but failed to save profile details.");
      setLoading(false);
      return;
    }

    setMessage("Account created. Please check your email to confirm.");
    setLoading(false);
  }

  async function sendOtpCode() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: otpEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: "https://sub4u.vercel.app",
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setOtpSent(true);
      setMessage("A pin code was sent to your email.");
    }

    setLoading(false);
  }

  async function verifyOtpCode() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.verifyOtp({
      email: otpEmail,
      token: otpCode,
      type: "email",
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signed in successfully.");
      window.location.href = "/";
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex gap-3">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setMessage("");
            }}
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              mode === "signup"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Sign up
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setMessage("");
            }}
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              mode === "signin"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Sign in
          </button>
        </div>

        {mode === "signup" ? (
          <div className="space-y-5">
            <h1 className="text-3xl font-bold text-gray-900">Create account</h1>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                placeholder="0501234567"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ID number
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                placeholder="ID number"
              />
            </div>

            {message && (
              <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-700">
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Create account"}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <h1 className="text-3xl font-bold text-gray-900">Sign in</h1>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                placeholder="you@example.com"
              />
            </div>

            {otpSent && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Pin code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  placeholder="Enter the pin code"
                />
              </div>
            )}

            {message && (
              <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-700">
                {message}
              </div>
            )}

            {!otpSent ? (
              <button
                type="button"
                onClick={sendOtpCode}
                disabled={loading}
                className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                {loading ? "Please wait..." : "Send pin code"}
              </button>
            ) : (
              <button
                type="button"
                onClick={verifyOtpCode}
                disabled={loading}
                className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                {loading ? "Please wait..." : "Verify pin code"}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}