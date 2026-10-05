import type { Metadata } from "next";
import { NewsDetail, newsMetadata } from "@/components/content/news-detail";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return newsMetadata(slug, locale);
}

export default function Page({ params }: Props) {
  return <NewsDetail params={params} />;
}
