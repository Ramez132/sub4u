"use client";

import { useState } from "react";
import { type Language } from "@/lib/translations";
import ContractModal from "@/app/components/ContractModal";

type Props = {
  lang: Language;
  userId: string;
  contractSignedAt: string | null;
};

export default function ContractButton({ lang, userId, contractSignedAt }: Props) {
  const [showContract, setShowContract] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(contractSignedAt);
  const isHe = lang === "he";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(isHe ? "he-IL" : "en-US", {
      day: "numeric", month: "long", year: "numeric",
    });

  return (
    <>
      {showContract && (
        <ContractModal
          onClose={() => setShowContract(false)}
          onSigned={() => setSignedAt(new Date().toISOString())}
          lang={lang}
          userId={userId}
          readOnly={!!signedAt}
        />
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowContract(true)}
          className="inline-flex items-center gap-2 rounded-full border border-teal-600 px-5 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          📄 {isHe ? "צפה בחוזה" : "View Contract"}
        </button>

        {signedAt ? (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            ✅ {isHe ? `נחתם ב-${formatDate(signedAt)}` : `Signed on ${formatDate(signedAt)}`}
          </span>
        ) : (
          <span className="text-sm text-gray-400">
            {isHe ? "לא נחתם עדיין" : "Not signed yet"}
          </span>
        )}
      </div>
    </>
  );
}