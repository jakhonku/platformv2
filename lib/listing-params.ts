import { CATEGORIES, INSTRUMENTS, REGIONS, VOICE_TYPES } from "./constants/index.ts";
import { compact, oneOf, parsePage, str, type RawParams } from "./catalog-params.ts";
import type { CastingFilters, EventFilters, MasterClassFilters, NewsFilters, ProjectFilters, VacancyFilters } from "./data/filters.ts";

const KINDS = ["musician", "vocalist", "conductor", "composer"] as const;
const SORTS = ["deadline", "recent"] as const;
const EMPLOYMENT = ["full_time", "part_time", "contract"] as const;

const idIn = (list: readonly { id: string }[], v: string | undefined): string | undefined => list.find((x) => x.id === v)?.id;

export type OpportunityParams = {
  filters: CastingFilters | VacancyFilters;
  page: number;
  sort: (typeof SORTS)[number];
  activeCount: number;
};

export function parseOpportunityParams(kind: "casting" | "vacancy", raw: RawParams): OpportunityParams {
  const sort = oneOf(str(raw, "sort"), SORTS) ?? "deadline";
  const active = compact({
    q: str(raw, "q"),
    kind: oneOf(str(raw, "kind"), KINDS),
    instrumentId: idIn(INSTRUMENTS, str(raw, "instrument")),
    voiceTypeId: idIn(VOICE_TYPES, str(raw, "voice")),
    regionId: idIn(REGIONS, str(raw, "region")),
    status: oneOf(str(raw, "status"), ["open", "closed"] as const),
    employment: kind === "vacancy" ? oneOf(str(raw, "employment"), EMPLOYMENT) : undefined,
  });
  return { filters: { ...active, sort }, page: parsePage(raw), sort, activeCount: Object.keys(active).length };
}

type Parsed<F> = { filters: F; page: number; activeCount: number };

const build = <F extends object>(active: F, raw: RawParams): Parsed<F> => {
  const filters = compact(active);
  return { filters, page: parsePage(raw), activeCount: Object.keys(filters).length };
};

export const parseEventParams = (raw: RawParams): Parsed<EventFilters> =>
  build<EventFilters>(
    { q: str(raw, "q"), status: oneOf(str(raw, "status"), ["upcoming", "ongoing", "finished"] as const), regionId: idIn(REGIONS, str(raw, "region")) },
    raw,
  );

export const parseProjectParams = (raw: RawParams): Parsed<ProjectFilters> =>
  build<ProjectFilters>({ q: str(raw, "q"), status: oneOf(str(raw, "status"), ["planned", "active", "completed"] as const) }, raw);

export const parseNewsParams = (raw: RawParams): Parsed<NewsFilters> =>
  build<NewsFilters>({ q: str(raw, "q"), categoryId: idIn(CATEGORIES.filter((c) => c.kind === "news"), str(raw, "category")) }, raw);

export const parseMasterClassParams = (raw: RawParams): Parsed<MasterClassFilters> =>
  build<MasterClassFilters>(
    { q: str(raw, "q"), instrumentId: idIn(INSTRUMENTS, str(raw, "instrument")), format: oneOf(str(raw, "format"), ["online", "offline"] as const) },
    raw,
  );
