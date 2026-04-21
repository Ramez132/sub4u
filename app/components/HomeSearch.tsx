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
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
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
      const overlaps = listingStart <= end && listingEnd >= start;

      if (overlaps) return true;
    }
  }

  return false;
}

export default function HomeSearch({
  initialListings,
  lang,
}: {
  initialListings: Listing[];
  lang: "en" | "he";
}) {
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const t = translations[lang];

  const resultsRef = useRef<HTMLElement | null>(null);

  const filteredListings = useMemo(() => {
    return initialListings.filter((listing) => {
      const cityMatch =
        selectedCity === "all" ? true : listing.city === selectedCity;

      const monthMatch = doesListingMatchSelectedMonths(
        listing.start_date,
        listing.end_date,
        selectedMonths
      );

      return cityMatch && monthMatch;
    });
  }, [initialListings, selectedCity, selectedMonths]);

  const handleMonthChange = (month: string, checked: boolean) => {
    setSelectedMonths((prev) =>
      checked ? [...prev, month] : prev.filter((m) => m !== month)
    );
  };

  const handleSearch = () => {
    setHasSearched(true);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <>
      <section
        className="relative h-[70vh] min-h-[500px] w-full bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl">
            Sub4U
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-white/90 md:text-2xl">
            {t.slogan}
          </p>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("search-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-10 inline-flex items-center rounded-full bg-orange-500 px-10 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-orange-600"
          >
            {t.letsStart}
          </button>
        </div>
      </section>

      <section id="search-section" className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex w-full flex-col gap-3 rounded-[2rem] bg-white p-4 shadow-2xl md:flex-row md:items-start md:gap-0">
          <div className="flex-1 px-4 py-3 text-left">
            <label className="mb-2 block text-sm font-medium text-gray-500">
              {t.city}
            </label>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent text-base text-gray-900 outline-none"
            >
              <option value="all">{t.allCities}</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden h-24 w-px bg-gray-200 md:block" />

          <div className="flex-1 px-4 py-3 text-left">
            <label className="mb-3 block text-sm font-medium text-gray-500">
              {t.months}
            </label>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {monthOptions.map((month) => (
  <label
    key={month}
    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800"
  >
    <input
      type="checkbox"
      checked={selectedMonths.includes(month)}
      onChange={(e) =>
        handleMonthChange(month, e.target.checked)
      }
      className="h-4 w-4"
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
              className="w-full rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white transition hover:bg-orange-600 md:w-auto"
            >
              {t.search}
            </button>
          </div>
        </div>
      </section>

      <section
        ref={resultsRef}
        id="results-section"
        className="mx-auto max-w-7xl px-4 py-12"
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedCity === "all"
              ? t.availableSublets
              : `${t.subletsIn} ${selectedCity}`}
          </h2>

          <p className="text-sm text-gray-500">
            {filteredListings.length} {t.listingsCount}
          </p>
        </div>

        {selectedMonths.length > 0 && (
  <div className="mb-6 flex flex-wrap gap-2">
    {selectedMonths.map((month) => (
      <span
        key={month}
        className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700"
      >
        {t.monthLabels[month as keyof typeof t.monthLabels]}
      </span>
    ))}
  </div>
)}

        {filteredListings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="h-52 w-full bg-gray-200" />

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {listing.title}
                    </h3>
                    <span className="whitespace-nowrap rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                      ₪{listing.price}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">{listing.city}</p>
                  <p className="mb-2 text-sm text-gray-500">
                    {listing.neighborhood}
                  </p>

                  <p className="mb-3 text-sm text-gray-700">
                    {listing.description}
                  </p>

                  <p className="mb-4 text-sm text-gray-500">
                    {listing.start_date} → {listing.end_date}
                  </p>

                  <a
                    href={`/listings/${listing.id}`}
                    className="mt-auto block w-full rounded-full border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                  >
                    {t.viewListing}
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-10 text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              {t.noListingsFound}
            </h3>
            <p className="mt-2 text-gray-600">
              {t.tryDifferent}
            </p>
          </div>
        ) : null}
      </section>
    </>
  );
}