import type { Metadata } from "next";
import { CollectivePage } from "@/components/collective/collective-page";
import { collectiveMetadata } from "@/components/collective/metadata";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return collectiveMetadata("orchestra", slug, locale);
}

export default function Page({ params }: Props) {
  return <CollectivePage type="orchestra" params={params} />;
}
