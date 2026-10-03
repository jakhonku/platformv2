import type { Metadata } from "next";
import { OrganizationCatalog } from "@/components/catalog/organization-catalog";
import { catalogMetadata } from "@/components/catalog/metadata";
import type { RawParams } from "@/lib/catalog-params";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return catalogMetadata("organizations", locale);
}

export default function Page({ searchParams }: { searchParams: Promise<RawParams> }) {
  return <OrganizationCatalog  searchParams={searchParams} />;
}
