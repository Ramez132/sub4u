"use client";

import { useMemo, useRef, useState } from "react";
import { translations, type Language } from "@/lib/translations";

type Listing = {
  id: number;
  title: string;
  city: string;
  neighborhood: string | null;
  price: number;
  description: string | null;
  start_date: string;
  end_date: string;
  is_boosted?: boolean | null;
  boost_expires_at?: string | null;
};

const cities = ["Tel Aviv", "Ramat Gan", "Herzliya", "Givatayim"];

const monthOptions = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function formatMonth(month: string) {
  return month.charAt(0).toUpperCase() + month.slice(1);
}

function getMonthRangeForYear(month: string, year: number) {
  const monthIndex = monthOptions.indexOf(month);
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 0));
  return { start, end };
}

function doesListingMatchSelectedMonths(
  startDate: string,
  endDate: string,
  selectedMonths: string[]
) {
  if (selectedMonths.length === 0) return true;
  const listingStart = new Date(startDate);
  const listingEnd = new Date(endDate);
  for (const month of selectedMonths) {
    const startYear = listingStart.getUTCFullYear();
    const endYear = listingEnd.getUTCFullYear();
    for (let year = startYear; year <= endYear; year++) {
      const { start, end } = getMonthRangeForYear(month, year);
      if (listingStart <= end && listingEnd >= start) return true;
    }
  }
  return false;
}

// Mini carousel component for each card
function CardCarousel({ images, listingId }: { images: string[]; listingId: number }) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div className="h-52 w-full bg-gray-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="relative h-52 w-full overflow-hidden bg-gray-100">
      <img
        src={images[current]}
        alt={`Listing image ${current + 1}`}
        className="h-full w-full object-cover transition-opacity duration-300"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow transition hover:bg-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow transition hover:bg-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white">
            {current + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}

export default function HomeSearch({
  initialListings,
  imagesByListing = {},
  lang,
}: {
  initialListings: Listing[];
  imagesByListing?: Record<number, string[]>;
  lang: "en" | "he";
}) {
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const t = translations[lang];
  const resultsRef = useRef<HTMLElement | null>(null);

  const filteredListings = useMemo(() => {
    return initialListings.filter((listing) => {
      const cityMatch = selectedCity === "all" ? true : listing.city === selectedCity;
      const monthMatch = doesListingMatchSelectedMonths(listing.start_date, listing.end_date, selectedMonths);
      return cityMatch && monthMatch;
    });
  }, [initialListings, selectedCity, selectedMonths]);

  const handleMonthChange = (month: string, checked: boolean) => {
    setSelectedMonths((prev) => checked ? [...prev, month] : prev.filter((m) => m !== month));
  };

  const handleSearch = () => {
    setHasSearched(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <>
      <section
        className="relative h-[70vh] min-h-[500px] w-full bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <div className="absolute inset-0 bg-[#1E3A5F]/60" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl">Sub4U</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/90 md:text-2xl">{t.slogan}</p>
          <button
            type="button"
            onClick={() => document.getElementById("search-section")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-10 inline-flex items-center rounded-full bg-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700"
          >
            {t.letsStart}
          </button>
        </div>
      </section>

      <section id="search-section" className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex w-full flex-col gap-3 rounded-[2rem] bg-white p-4 shadow-2xl md:flex-row md:items-start md:gap-0">
          <div className="flex-1 px-4 py-3 text-left">
            <label className="mb-2 block text-sm font-medium text-gray-500">{t.city}</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent text-base text-gray-900 outline-none"
            >
              <option value="all">{t.allCities}</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="hidden h-24 w-px bg-gray-200 md:block" />

          <div className="flex-1 px-4 py-3 text-left">
            <label className="mb-3 block text-sm font-medium text-gray-500">{t.months}</label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {monthOptions.map((month) => (
                <label key={month} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={selectedMonths.includes(month)}
                    onChange={(e) => handleMonthChange(month, e.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span>{t.monthLabels[month as keyof typeof t.monthLabels]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center px-4 py-3">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white transition hover:bg-blue-700 md:w-auto"
            >
              {t.search}
            </button>
          </div>
        </div>
      </section>

      <section ref={resultsRef} id="results-section" className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedCity === "all" ? t.availableSublets : `${t.subletsIn} ${selectedCity}`}
          </h2>
          <p className="text-sm text-gray-500">{filteredListings.length} {t.listingsCount}</p>
        </div>

        {selectedMonths.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {selectedMonths.map((month) => (
              <span key={month} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                {t.monthLabels[month as keyof typeof t.monthLabels]}
              </span>
            ))}
          </div>
        )}

        {filteredListings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                {/* Image carousel */}
                <CardCarousel
                  images={imagesByListing[listing.id] ?? []}
                  listingId={listing.id}
                />

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-gray-900">{listing.title}</h3>
                    <span className="whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                      ₪{listing.price.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">{listing.city}</p>
                  <p className="mb-2 text-sm text-gray-500">{listing.neighborhood}</p>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-700">{listing.description}</p>
                  <p className="mb-4 text-sm text-gray-500">{listing.start_date} → {listing.end_date}</p>

                  <a
                    href={`/listings/${listing.id}?lang=${lang}`}
                    className="mt-auto block w-full rounded-full border border-blue-600 px-4 py-3 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    {t.viewListing}
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-10 text-center">
            <h3 className="text-xl font-semibold text-gray-900">{t.noListingsFound}</h3>
            <p className="mt-2 text-gray-600">{t.tryDifferent}</p>
          </div>
        ) : null}
      </section>
    </>
  );
}