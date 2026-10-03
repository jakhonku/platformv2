import type { Metadata } from "next";
import { CollectiveCatalog } from "@/components/catalog/collective-catalog";
import { catalogMetadata } from "@/components/catalog/metadata";
import type { RawParams } from "@/lib/catalog-params";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return catalogMetadata("choirs", locale);
}

export default function Page({ searchParams }: { searchParams: Promise<RawParams> }) {
  return <CollectiveCatalog type="choir" searchParams={searchParams} />;
}
