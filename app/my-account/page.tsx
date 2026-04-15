import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import { revalidatePath } from "next/cache";

function maskIdNumber(idNumber: string) {
  if (!idNumber) return "";
  if (idNumber.length <= 4) return idNumber;
  return "*".repeat(idNumber.length - 4) + idNumber.slice(-4);
}

export default async function MyAccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  async function boostListing(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const listingId = Number(formData.get("listingId"));

  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 12); // temporary: 12-minute boost

  await supabase
    .from("listings")
    .update({
      is_boosted: true,
      boost_expires_at: expires.toISOString(),
    })
    .eq("id", listingId)
    .eq("user_id", user.id);
    revalidatePath("/my-account");
    revalidatePath("/");
}

  return (
  <>
    <PageHeader title="My Account" />

    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              Personal Information
            </h2>

            <div className="space-y-4 text-gray-700">
              <p>
                <span className="font-semibold text-gray-900">Full name:</span>{" "}
                {profile?.full_name || "-"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Email:</span>{" "}
                {profile?.email || user.email || "-"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Phone number:</span>{" "}
                {profile?.phone_number || "-"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">ID number:</span>{" "}
                {profile?.id_number ? maskIdNumber(profile.id_number) : "-"}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              Payment Methods
            </h2>

            <p className="text-gray-600">No payment methods added yet.</p>
          </section>
        </div>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            My Listings
          </h2>

          {listings && listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing) => (
  <div
    key={listing.id}
    className="rounded-2xl border border-gray-200 px-4 py-4 transition hover:border-gray-300 hover:bg-gray-50"
  >
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {listing.title}
        </h3>

        {/* ✅ ADD THIS HERE */}
        {listing.is_boosted && listing.boost_expires_at && (
  <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-600">
    Boosted 🚀
  </span>
)}
        
        <p className="text-sm text-gray-600">
          {listing.city}
          {listing.neighborhood ? ` · ${listing.neighborhood}` : ""}
        </p>
      </div>

      <div className="text-sm font-semibold text-orange-600">
        ₪{listing.price}
      </div>
    </div>

    <form action={boostListing} className="mt-4">
      <input type="hidden" name="listingId" value={listing.id} />
      <button
        type="submit"
        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        Boost Listing 🚀
      </button>
    </form>
  </div>
))}
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 px-4 py-6 text-gray-600">
              You have not created any listings yet.
            </div>
          )}
        </section>
      </div>
    </main>
  </>
);
}