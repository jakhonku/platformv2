import type { Metadata } from "next";
import { EducationDetail, educationMetadata } from "@/components/content/education-detail";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return educationMetadata(slug, locale);
}

export default function Page({ params }: Props) {
  return <EducationDetail params={params} />;
}
