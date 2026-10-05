import type { Metadata } from "next";
import { EducationList } from "@/components/content/content-lists";
import { listingMetadata } from "@/components/listing/metadata";
import type { RawParams } from "@/lib/catalog-params";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return listingMetadata("education", locale);
}

export default function Page({ searchParams }: { searchParams: Promise<RawParams> }) {
  return <EducationList searchParams={searchParams} />;
}
