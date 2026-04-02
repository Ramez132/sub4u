import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";

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

  return (
    <>
      <PageHeader title="My Account" />

      <main className="min-h-screen bg-white px-4 py-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-8 text-4xl font-bold text-gray-900">My Account</h1>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                Personal Information
              </h2>

              <div className="space-y-3 text-gray-700">
                <p><span className="font-semibold">Full name:</span> {profile?.full_name || "-"}</p>
                <p><span className="font-semibold">Email:</span> {profile?.email || user.email || "-"}</p>
                <p><span className="font-semibold">Phone number:</span> {profile?.phone_number || "-"}</p>
                <p><span className="font-semibold">ID number:</span> {profile?.id_number ? maskIdNumber(profile.id_number) : "-"}</p>
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                Payment Methods
              </h2>
              <p className="text-gray-600">No payment methods added yet.</p>
            </section>
          </div>

          <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              My Listings
            </h2>

            {listings && listings.length > 0 ? (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="rounded-2xl border border-gray-200 px-4 py-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {listing.city}
                          {listing.neighborhood ? ` · ${listing.neighborhood}` : ""}
                        </p>
                      </div>

                      <div className="text-sm font-medium text-orange-700">
                        ₪{listing.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">You have not created any listings yet.</p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}