export type SearchType = "talents" | "collectives" | "castings" | "vacancies";

export const SEARCH_TYPES: readonly SearchType[] = ["talents", "collectives", "castings", "vacancies"];

const CATALOG: Record<SearchType, string> = {
  talents: "/musicians",
  collectives: "/orchestras",
  castings: "/castings",
  vacancies: "/vacancies",
};

/** Locale prefiksisiz katalog yo'li; so'rov bo'sh bo'lsa `q` qo'shilmaydi */
export function buildSearchHref(type: SearchType, query: string): string {
  const q = query.trim();
  return q ? `${CATALOG[type]}?q=${encodeURIComponent(q)}` : CATALOG[type];
}
