import { type Language } from "@/lib/translations";
import CreateListingClient from "./CreateListingClient";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function CreateListingPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const lang: Language = searchParams?.lang === "he" ? "he" : "en";

  return <CreateListingClient lang={lang} />;
}