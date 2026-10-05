import type { Metadata } from "next";
import { EventList } from "@/components/content/event-list";
import { listingMetadata } from "@/components/listing/metadata";
import type { RawParams } from "@/lib/catalog-params";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return listingMetadata("festivals", locale);
}

export default function Page({ searchParams }: { searchParams: Promise<RawParams> }) {
  return <EventList kind="festival" searchParams={searchParams} />;
}
