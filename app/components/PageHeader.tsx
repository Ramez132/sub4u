"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { translations, type Language } from "@/lib/translations";

type Props = {
  title: string;
  lang?: Language;
};

export default function PageHeader({ title, lang = "en" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const toggleLang = () => {
    const nextLang = lang === "en" ? "he" : "en";
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLang);
    router.push(`${pathname}?${params.toString()}`);
  };

  const t = translations[lang];
  const isHe = lang === "he";

  return (
    <header className="border-b border-gray-200 bg-white" dir={isHe ? "rtl" : "ltr"}>
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {t.back}
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>

        <button
          onClick={toggleLang}
          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {isHe ? "🇺🇸 English" : "🇮🇱 עברית"}
        </button>
      </div>
    </header>
  );
}