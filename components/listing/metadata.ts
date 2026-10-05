import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { listingHref, type ListingKey } from "@/lib/listing-keys";

const alternates = (locale: string, path: string): Metadata["alternates"] => ({
  canonical: `/${locale}${path}`,
  languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
});

export async function listingMetadata(key: ListingKey, locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "listing" });
  const title = t(`title.${key}`);
  const description = t(`description.${key}`);
  return { title, description, alternates: alternates(locale, listingHref(key)), openGraph: { type: "website", title, description, locale } };
}

export function detailMetadata(p: { title: string; description: string; path: string; locale: string; image?: string; type?: "website" | "article" }): Metadata {
  const description = p.description.length > 160 ? `${p.description.slice(0, 157).trimEnd()}…` : p.description;
  return {
    title: p.title,
    description,
    alternates: alternates(p.locale, p.path),
    openGraph: { type: p.type ?? "website", title: p.title, description, locale: p.locale, ...(p.image ? { images: [{ url: p.image, alt: p.title }] } : {}) },
  };
}
