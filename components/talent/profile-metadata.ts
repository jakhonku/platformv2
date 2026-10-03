import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { talent as talentRoute } from "@/lib/routes";
import type { TalentKind } from "@/types/talent";
import { loadTalent } from "./load-talent";

export async function profileMetadata(kind: TalentKind, slug: string, locale: string): Promise<Metadata> {
  const talent = await loadTalent(slug);
  if (!talent || talent.kind !== kind) return {};
  const title = `${talent.fullName} — ${talent.specialty}`;
  const description = talent.bio.length > 160 ? `${talent.bio.slice(0, 157).trimEnd()}…` : talent.bio;
  const path = talentRoute(kind, slug);
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
    },
    openGraph: { type: "profile", title, description, locale, images: [{ url: talent.photoUrl, alt: talent.fullName }] },
  };
}
