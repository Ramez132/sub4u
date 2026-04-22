"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { translations, type Language } from "@/lib/translations";

type Props = {
  title: string;
  lang?: Language;
  backHref?: string;
};

export default function PageHeader({ title, lang: langProp = "en", backHref = "/" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Always read lang live from the URL so toggling language is reflected instantly
  const currentLang = (searchParams.get("lang") === "he" ? "he" : langProp) as Language;
  const isHe = currentLang === "he";
  const t = translations[currentLang];

  const toggleLang = () => {
    const nextLang = currentLang === "en" ? "he" : "en";
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLang);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBack = () => {
    // Carry current lang (from URL) back to the previous page
    const params = new URLSearchParams();
    params.set("lang", currentLang);
    router.push(`${backHref}?${params.toString()}`);
  };

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