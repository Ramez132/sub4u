import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/app/components/SignOutButton";

type SearchParams = Promise<{
  city?: string;
  months?: string | string[];
}>;

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

      if (overlaps) {
        return true;
      }
    }
  }

  return false;
}

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const selectedCity = searchParams.city ?? "all";

  const selectedMonths = Array.isArray(searchParams.months)
    ? searchParams.months
    : searchParams.months
      ? [searchParams.months]
      : [];

  const supabase = await createClient();

  const {
  data: { user },
} = await supabase.auth.getUser();

  let listingsQuery = supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (selectedCity !== "all") {
    listingsQuery = listingsQuery.eq("city", selectedCity);
  }

  const { data, error } = await listingsQuery;

  const listings =
  data?.filter((listing) =>
    doesListingMatchSelectedMonths(
      listing.start_date,
      listing.end_date,
      selectedMonths
    )
  ) ?? [];

  return (
    <main className="min-h-screen bg-white">
      <header className="absolute left-0 top-0 z-20 w-full">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
    <a href="/" className="text-2xl font-bold text-white">
      Sub4U
    </a>

    <nav className="flex items-center gap-4">
  {user ? (
    <>
      <a
        href="/create-listing"
        className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        Create listing
      </a>

      <SignOutButton />
    </>
  ) : (
    <a
      href="/sign-in"
      className="rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-white"
    >
      Sign in
    </a>
  )}
</nav>
  </div>
</header>
      <section
        className="relative h-[70vh] min-h-[500px] w-full bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-8 max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
            Welcome To Sub4U
          </h1>

          <form
            method="GET"
            className="flex w-full max-w-6xl flex-col gap-3 rounded-[2rem] bg-white p-4 shadow-2xl md:flex-row md:items-start md:gap-0"
          >
            <div className="flex-1 px-4 py-3 text-left">
              <label className="mb-2 block text-sm font-medium text-gray-500">
                City
              </label>

              <select
                name="city"
                defaultValue={selectedCity}
                className="w-full bg-transparent text-base text-gray-900 outline-none"
              >
                <option value="all">All cities</option>
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
                Months
              </label>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {monthOptions.map((month) => (
                  <label
                    key={month}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800"
                  >
                    <input
                      type="checkbox"
                      name="months"
                      value={month}
                      defaultChecked={selectedMonths.includes(month)}
                      className="h-4 w-4"
                    />
                    <span>{formatMonth(month)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center px-4 py-3">
              <button className="w-full rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white transition hover:bg-orange-600 md:w-auto">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedCity === "all"
              ? "Available sublets"
              : `Sublets in ${selectedCity}`}
          </h2>

          <p className="text-sm text-gray-500">
            {listings.length} listing(s)
          </p>
        </div>

        {selectedMonths.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {selectedMonths.map((month) => (
              <span
                key={month}
                className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700"
              >
                {formatMonth(month)}
              </span>
            ))}
          </div>
        )}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Failed to load listings.
          </div>
        ) : listings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
  {listings.map((listing) => (
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
        <p className="mb-2 text-sm text-gray-500">{listing.neighborhood}</p>

        <p className="mb-3 text-sm text-gray-700">{listing.description}</p>

        <p className="mb-4 text-sm text-gray-500">
          {listing.start_date} → {listing.end_date}
        </p>

        <a
          href={`/listings/${listing.id}`}
          className="mt-auto block w-full rounded-full border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
        >
          View listing
        </a>
      </div>
    </div>
  ))}
</div>
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-10 text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              No listings found
            </h3>
            <p className="mt-2 text-gray-600">
              Try choosing a different city or month.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}