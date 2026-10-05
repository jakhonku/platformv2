import type { Metadata } from "next";
import { OpportunityList } from "@/components/casting/opportunity-list";
import { listingMetadata } from "@/components/listing/metadata";
import type { RawParams } from "@/lib/catalog-params";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return listingMetadata("vacancies", locale);
}

export default function Page({ searchParams }: { searchParams: Promise<RawParams> }) {
  return <OpportunityList kind="vacancy" searchParams={searchParams} />;
}
