import type { Metadata } from "next";
import { TalentCatalog } from "@/components/catalog/talent-catalog";
import { catalogMetadata } from "@/components/catalog/metadata";
import type { RawParams } from "@/lib/catalog-params";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return catalogMetadata("musicians", locale);
}

export default function Page({ searchParams }: { searchParams: Promise<RawParams> }) {
  return <TalentCatalog kind="musician" searchParams={searchParams} />;
}
