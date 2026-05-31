import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import PageHeader from "@/app/components/PageHeader";
import DeleteUserModal from "@/app/components/DeleteUserModal";
import AddHandymanForm from "@/app/components/AddHandymanForm";

const ADMIN_ID = "ec1ad54f-66cf-4ee0-b8d6-14b7107725e5";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== ADMIN_ID) {
    redirect("/");
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: deletedUsers } = await supabase
    .from("deleted_users")
    .select("*")
    .order("deleted_at", { ascending: false });

  const { count: totalConversations } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true });

  const { count: totalMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true });

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  const activeListings = (listings ?? []).filter((l) => l.status !== "rented").length;
  const rentedListings = (listings ?? []).filter((l) => l.status === "rented").length;

  async function deleteListing(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const listingId = Number(formData.get("listingId"));
    await supabase.from("listings").delete().eq("id", listingId);
    revalidatePath("/admin");
  }

  const stats = [
    { label: "Total Users", value: (profiles ?? []).length, color: "bg-blue-50 text-blue-700" },
    { label: "Total Listings", value: (listings ?? []).length, color: "bg-teal-50 text-teal-700" },
    { label: "Active", value: activeListings, color: "bg-green-50 text-green-700" },
    { label: "Rented", value: rentedListings, color: "bg-gray-50 text-gray-700" },
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
                    const owner = listing.user_id ? profileMap[listing.user_id] : null;
                    return (
                      <tr key={listing.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 text-gray-400">#{listing.id}</td>
                        <td className="py-3 pr-4 font-medium text-gray-900 max-w-[180px] truncate">{listing.title}</td>
                        <td className="py-3 pr-4 text-gray-500 text-xs">{owner?.email ?? "-"}</td>
                        <td className="py-3 pr-4 text-gray-600">{listing.city}</td>
                        <td className="py-3 pr-4 font-semibold text-teal-600">₪{listing.price?.toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            listing.status === "rented" ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"
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
                              <button type="submit" className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-100">
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
                    <tr key={profile.id} className={`hover:bg-gray-50 ${profile.id === ADMIN_ID ? "opacity-40" : ""}`}>
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
                        {profile.id !== ADMIN_ID && (
                          <DeleteUserModal
                            userId={profile.id}
                            userName={profile.full_name || ""}
                            userEmail={profile.email || ""}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Deleted Users */}
          {(deletedUsers ?? []).length > 0 && (
            <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Deleted Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Phone</th>
                      <th className="pb-3 pr-4">Reason</th>
                      <th className="pb-3">Deleted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(deletedUsers ?? []).map((du) => (
                      <tr key={du.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 text-gray-700">{du.full_name || "-"}</td>
                        <td className="py-3 pr-4 text-gray-500">{du.email}</td>
                        <td className="py-3 pr-4 text-gray-500">{du.phone_number || "-"}</td>
                        <td className="py-3 pr-4 text-gray-500 max-w-[200px] truncate">{du.reason}</td>
                        <td className="py-3 text-gray-400 text-xs">
                          {new Date(du.deleted_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Handymen */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Handymen</h2>
              <AddHandymanForm />
            </div>
            <HandymenList />
          </section>

        </div>
      </main>
    </>
  );
}

async function HandymenList() {
  const supabase = await createClient();
  const { data: handymen } = await supabase.from("handymen").select("*").order("created_at", { ascending: false });

  async function deleteHandyman(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase.from("handymen").delete().eq("id", formData.get("handymanId") as string);
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin");
  }

  if (!handymen || handymen.length === 0) {
    return <p className="text-sm text-gray-400">No handymen added yet. Click "+ Add Handyman" to get started.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
            <th className="pb-3 pr-4">Name</th>
            <th className="pb-3 pr-4">Profession</th>
            <th className="pb-3 pr-4">City</th>
            <th className="pb-3 pr-4">Phone</th>
            <th className="pb-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {handymen.map((h) => (
            <tr key={h.id} className="hover:bg-gray-50">
              <td className="py-3 pr-4 font-medium text-gray-900">{h.name}</td>
              <td className="py-3 pr-4 text-gray-600">{h.profession}</td>
              <td className="py-3 pr-4 text-gray-500">{h.city}</td>
              <td className="py-3 pr-4 text-gray-500">{h.phone}</td>
              <td className="py-3">
                <div className="flex gap-2">
                  <a href={`/handymen/${h.id}`} target="_blank"
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    View
                  </a>
                  <form action={deleteHandyman}>
                    <input type="hidden" name="handymanId" value={h.id} />
                    <button type="submit" className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-100">
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}