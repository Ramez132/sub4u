"use client";

import { useState } from "react";
import { type Language } from "@/lib/translations";
import ContractModal from "@/app/components/ContractModal";

type Props = {
  lang: Language;
};

export default function ContractButton({ lang }: Props) {
  const [showContract, setShowContract] = useState(false);
  const isHe = lang === "he";

  return (
    <>
      {showContract && <ContractModal onClose={() => setShowContract(false)} lang={lang} />}
      <button
        onClick={() => setShowContract(true)}
        className="inline-flex items-center gap-2 rounded-full border border-teal-600 px-5 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
      >
        📄 {isHe ? "צפה בחוזה" : "View Contract"}
      </button>
    </>
  );
}