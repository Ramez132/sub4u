"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signed in successfully.");
      window.location.href = "/";
    }

    setLoading(false);
  }

  async function signUp() {
  setLoading(true);
  setMessage("");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "http://10.0.0.43:3000",
    },
  });

  if (error) {
    setMessage(error.message);
  } else {
    setMessage("Account created. Check your email to confirm your account.");
  }

  setLoading(false);
}

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Sign in</h1>
        <p className="mb-8 text-sm text-gray-600">
          Sign in to create and manage your listings.
        </p>

        <div className="space-y-5">
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
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="********"
            />
          </div>

          {message && (
            <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-700">
              {message}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={signIn}
              disabled={loading}
              className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={signUp}
              disabled={loading}
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-60"
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}