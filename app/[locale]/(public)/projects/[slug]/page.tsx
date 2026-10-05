import type { Metadata } from "next";
import { ProjectDetail, projectMetadata } from "@/components/content/project-detail";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return projectMetadata(slug, locale);
}

export default function Page({ params }: Props) {
  return <ProjectDetail params={params} />;
}
