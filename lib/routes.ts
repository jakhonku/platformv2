import type { CollectiveType } from "../types/collective.ts";
import type { TalentKind } from "../types/talent.ts";

/** Locale prefiksisiz yo'llar: ularni `@/i18n/navigation` Link'i locale bilan to'ldiradi */
const TALENT_SECTION: Record<TalentKind, string> = {
  musician: "musicians",
  vocalist: "vocalists",
  conductor: "conductors",
  composer: "composers",
};

export const talentSection = (kind: TalentKind): string => `/${TALENT_SECTION[kind]}`;
export const talent = (kind: TalentKind, slug: string): string => `${talentSection(kind)}/${slug}`;
export const collectiveSection = (type: CollectiveType): string => (type === "orchestra" ? "/orchestras" : "/choirs");
export const collective = (type: CollectiveType, slug: string): string =>
  `${collectiveSection(type)}/${slug}`;
export const organization = (slug: string): string => `/organizations/${slug}`;
export const casting = (id: string): string => `/castings/${id}`;
export const vacancy = (id: string): string => `/vacancies/${id}`;
export const competition = (slug: string): string => `/competitions/${slug}`;
export const festival = (slug: string): string => `/festivals/${slug}`;
export const project = (slug: string): string => `/projects/${slug}`;
export const news = (slug: string): string => `/news/${slug}`;
