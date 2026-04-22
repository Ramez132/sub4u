"use client";

import { useState } from "react";

type Props = {
  listingId: number;
  deleteAction: (formData: FormData) => Promise<void>;
  isHe: boolean;
};

export default function DeleteListingButton({ listingId, deleteAction, isHe }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {isHe ? "בטוח?" : "Sure?"}
        </span>
        <form action={deleteAction}>
          <input type="hidden" name="listingId" value={listingId} />
          <button
            type="submit"
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            {isHe ? "מחק" : "Delete"}
          </button>
        </form>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          {isHe ? "ביטול" : "Cancel"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
    >
      {isHe ? "מחק" : "Delete"}
    </button>
  );
}