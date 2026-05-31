"use client";

import { useState } from "react";

type Props = {
  userId: string;
  userName: string;
  userEmail: string;
};

export default function DeleteUserModal({ userId, userName, userEmail }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleDelete() {
    if (!reason.trim()) return;
    setLoading(true);

    const res = await fetch("/api/admin-delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, reason }),
    });

    if (res.ok) {
      setDone(true);
      setTimeout(() => window.location.reload(), 1500);
    }

    setLoading(false);
  }

  if (done) {
    return (
      <span className="rounded-lg bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
        Deleted ✓
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-100"
      >
        Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="mb-1 text-lg font-bold text-gray-900">Delete User</h3>
            <p className="mb-4 text-sm text-gray-500">
              You are about to delete <strong>{userName || userEmail}</strong>. This will remove their profile and all listings. Please provide a reason.
            </p>

            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for deletion..."
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-400"
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => { setOpen(false); setReason(""); }}
                className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!reason.trim() || loading}
                className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}