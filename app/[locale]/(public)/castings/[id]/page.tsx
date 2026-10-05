import type { Metadata } from "next";
import { OpportunityDetail, opportunityMetadata } from "@/components/casting/opportunity-detail";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  return opportunityMetadata("casting", id, locale);
}

export default function Page({ params }: Props) {
  return <OpportunityDetail kind="casting" params={params} />;
}
