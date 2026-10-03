import type { Metadata } from "next";
import { organizationMetadata } from "@/components/collective/metadata";
import { OrganizationPage } from "@/components/collective/organization-page";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return organizationMetadata(slug, locale);
}

export default function Page({ params }: Props) {
  return <OrganizationPage params={params} />;
}
