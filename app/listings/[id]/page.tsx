import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ListingPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-3xl font-bold">{listing.title}</h1>

        <p className="mb-2 text-lg text-gray-700">
          📍 City: {listing.city}
        </p>

        <p className="mb-2 text-lg text-gray-700">
          💰 Price: ₪{listing.price}
        </p>

        <p className="mb-2 text-lg text-gray-700">
          📅 Available from: {listing.start_date}
        </p>

        <p className="mb-6 text-lg text-gray-700">
          📅 Available until: {listing.end_date}
        </p>

        {listing.description && (
          <p className="text-gray-800">{listing.description}</p>
        )}
      </div>
    </main>
  );
}