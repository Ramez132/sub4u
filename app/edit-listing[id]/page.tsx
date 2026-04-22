import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { type Language } from "@/lib/translations";
import EditListingClient from "./EditListingClient";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export default async function EditListingPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const lang: Language = searchParams?.lang === "he" ? "he" : "en";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?lang=${lang}&mode=signin`);

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !listing) notFound();

  return <EditListingClient listing={listing} lang={lang} />;
}