import type { Metadata } from "next";
import { EventDetail, eventMetadata } from "@/components/content/event-detail";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return eventMetadata("festival", slug, locale);
}

export default function Page({ params }: Props) {
  return <EventDetail kind="festival" params={params} />;
}
