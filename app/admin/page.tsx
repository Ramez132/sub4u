import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import PageHeader from "@/app/components/PageHeader";

const ADMIN_EMAIL = "ramez132@gmail.com";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  // Fetch stats
  const [
    { count: totalUsers },
    { count: totalListings },
    { count: activeListings },
    { count: rentedListings },
    { count: totalConversations },
    { count: totalMessages },
    { data: listings },
    { data: profiles },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "rented"),
    supabase.from("conversations").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*, profiles(full_name, email)").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
  ]);

  async function deleteListing(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const listingId = Number(formData.get("listingId"));
    await supabase.from("listings").delete().eq("id", listingId);
    revalidatePath("/admin");
  }

  async function deleteUser(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const userId = formData.get("userId") as string;
    await supabase.from("profiles").delete().eq("id", userId);
    revalidatePath("/admin");
  }

  const stats = [
    { label: "Total Users", value: totalUsers ?? 0, color: "bg-blue-50 text-blue-700" },
    { label: "Total Listings", value: totalListings ?? 0, color: "bg-teal-50 text-teal-700" },
    { label: "Active Listings", value: activeListings ?? 0, color: "bg-green-50 text-green-700" },
    { label: "Rented Listings", value: rentedListings ?? 0, color: "bg-gray-50 text-gray-700" },
    { label: "Conversations", value: totalConversations ?? 0, color: "bg-purple-50 text-purple-700" },
    { label: "Messages", value: totalMessages ?? 0, color: "bg-orange-50 text-orange-700" },
  ];

  return (
    <>
      <PageHeader title="Admin Dashboard" lang="en" backHref="/" />

      <main className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((stat) => (
              <div key={stat.label} className={`rounded-2xl p-4 text-center ${stat.color}`}>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs font-medium opacity-70">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Listings */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-gray-900">All Listings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">Title</th>
                    <th className="pb-3 pr-4">Owner</th>
                    <th className="pb-3 pr-4">City</th>
                    <th className="pb-3 pr-4">Price</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(listings ?? []).map((listing) => {
                    const owner = (Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles) as { full_name: string; email: string } | null;
                    return (
                      <tr key={listing.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 text-gray-400">#{listing.id}</td>
                        <td className="py-3 pr-4 font-medium text-gray-900 max-w-[200px] truncate">{listing.title}</td>
                        <td className="py-3 pr-4 text-gray-500 text-xs">{owner?.email ?? "-"}</td>
                        <td className="py-3 pr-4 text-gray-600">{listing.city}</td>
                        <td className="py-3 pr-4 font-semibold text-teal-600">₪{listing.price?.toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            listing.status === "rented"
                              ? "bg-gray-100 text-gray-500"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {listing.status ?? "active"}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <a href={`/listings/${listing.id}`} target="_blank"
                              className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
                              View
                            </a>
                            <form action={deleteListing}>
                              <input type="hidden" name="listingId" value={listing.id} />
                              <button type="submit"
                                className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-100"
                                onClick={(e) => { if (!confirm("Delete this listing?")) e.preventDefault(); }}>
                                Delete
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Users */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-gray-900">All Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Phone</th>
                    <th className="pb-3 pr-4">Contract</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(profiles ?? []).map((profile) => (
                    <tr key={profile.id} className={`hover:bg-gray-50 ${profile.email === ADMIN_EMAIL ? "opacity-50" : ""}`}>
                      <td className="py-3 pr-4 font-medium text-gray-900">{profile.full_name || "-"}</td>
                      <td className="py-3 pr-4 text-gray-500">{profile.email}</td>
                      <td className="py-3 pr-4 text-gray-500">{profile.phone_number || "-"}</td>
                      <td className="py-3 pr-4">
                        {profile.contract_signed_at ? (
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">✅ Signed</span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-400">Not signed</span>
                        )}
                      </td>
                      <td className="py-3">
                        {profile.email !== ADMIN_EMAIL && (
                          <form action={deleteUser}>
                            <input type="hidden" name="userId" value={profile.id} />
                            <button type="submit"
                              className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-100"
                              onClick={(e) => { if (!confirm("Delete this user?")) e.preventDefault(); }}>
                              Delete
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}