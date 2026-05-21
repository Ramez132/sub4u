"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import { type Language } from "@/lib/translations";

function AboutInner() {
  const searchParams = useSearchParams();
  const lang: Language = searchParams.get("lang") === "he" ? "he" : "en";
  const isHe = lang === "he";

  const content = {
    he: {
      title: "אודות Sub4U",
      paragraphs: [
        "Sub4U הוקם מתוך חוויה אישית שלנו כסטודנטים, אחרי שבועות ארוכים של חיפוש סאבלטים דרך פייסבוק, וואטסאפ ומודעות לא אמינות. אבל מהר מאוד הבנו שהבעיה היא לא רק למצוא דירה, אלא גם כל מה שקורה אחרי שסוגרים. חוסר ודאות, ביטולים, אי עמידה בהתחייבויות וחוסר הגנה אמיתית על השוכר או המשכיר.",
        "לכן הקמנו את Sub4U לא רק כפלטפורמה למציאת סאבלטים, אלא כמערכת מלאה שמעניקה ביטחון וסדר לאורך כל התהליך.",
        "הסאבלטים באתר מתבצעים באמצעות חוזה מסודר בין הצדדים, הכולל תנאים והתחייבויות ברורות. במקרה של הפרת התחייבות, אנו מסייעים בליווי ובפעולה מול הצד השני, כדי שהמשתמשים לא יצטרכו להתמודד לבד.",
        "המטרה שלנו היא להפוך את עולם הסאבלטים בישראל לפשוט, בטוח ונגיש יותר.",
      ],
    },
    en: {
      title: "About Sub4U",
      paragraphs: [
        "Sub4U was founded from our personal experience as students, after long weeks of searching for sublets through Facebook, WhatsApp and unreliable listings. But we quickly realized the problem isn't just finding an apartment — it's everything that happens after the deal is closed. Uncertainty, cancellations, broken commitments and a lack of real protection for either the tenant or the landlord.",
        "That's why we built Sub4U not just as a platform for finding sublets, but as a complete system that provides security and order throughout the entire process.",
        "Sublets on the site are conducted through a formal contract between the parties, including clear terms and commitments. In case of a breach, we assist in mediating and acting against the other party, so users don't have to face it alone.",
        "Our goal is to make the sublet world in Israel simpler, safer and more accessible.",
      ],
    },
  };

  const c = content[lang];

  return (
    <>
      <PageHeader title={c.title} lang={lang} backHref="/" />

      <main className="min-h-screen bg-gray-50 px-4 py-16" dir={isHe ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-3xl">

          {/* Hero card */}
          <div className="mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 p-10 text-white shadow-lg">
            <h1 className="mb-3 text-4xl font-bold">{c.title}</h1>
            <p className="text-teal-100 text-lg leading-relaxed">{c.paragraphs[0]}</p>
          </div>

          {/* Content cards */}
          <div className="space-y-5">
            {c.paragraphs.slice(1).map((paragraph, i) => (
              <div key={i} className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
                <p className="text-gray-600 leading-relaxed text-base">{paragraph}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 rounded-3xl border border-teal-100 bg-teal-50 p-8 text-center">
            <p className="mb-4 text-lg font-semibold text-teal-800">
              {isHe ? "מוכן להתחיל?" : "Ready to get started?"}
            </p>
            <a
              href={`/?lang=${lang}`}
              className="inline-block rounded-full bg-teal-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              {isHe ? "צפה במודעות" : "Browse listings"}
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

export default function AboutPage() {
  return (
    <Suspense>
      <AboutInner />
    </Suspense>
  );
}