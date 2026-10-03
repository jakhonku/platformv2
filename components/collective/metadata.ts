import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { collective as collectiveRoute, organization as organizationRoute } from "@/lib/routes";
import type { CollectiveType } from "@/types/collective";
import { loadCollective, loadOrganization } from "./load-collective";

const clip = (text: string): string => (text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text);

function build(path: string, locale: string, title: string, description: string, image: string): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
    },
    openGraph: { type: "website", title, description, locale, images: [{ url: image, alt: title }] },
  };
}

export async function collectiveMetadata(type: CollectiveType, slug: string, locale: string): Promise<Metadata> {
  const c = await loadCollective(slug);
  if (!c || c.type !== type) return {};
  return build(collectiveRoute(type, slug), locale, c.name, clip(c.description), c.logoUrl);
}

export async function organizationMetadata(slug: string, locale: string): Promise<Metadata> {
  const o = await loadOrganization(slug);
  if (!o) return {};
  return build(organizationRoute(slug), locale, o.name, clip(o.description), o.logoUrl);
}
