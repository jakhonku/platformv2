import type { Metadata } from "next";
import { profileMetadata } from "@/components/talent/profile-metadata";
import { TalentProfilePage } from "@/components/talent/talent-profile-page";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return profileMetadata("conductor", slug, locale);
}

export default function Page({ params }: Props) {
  return <TalentProfilePage kind="conductor" params={params} />;
}
