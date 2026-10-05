import type { CollectiveType } from "../types/collective.ts";
import type { TalentKind } from "../types/talent.ts";
import { INSTRUMENTS, REGIONS, VOICE_TYPES } from "./constants/index.ts";
import type { CollectiveFilters, OrganizationFilters, TalentFilters } from "./data/filters.ts";

export type RawParams = Record<string, string | string[] | undefined>;
export type View = "cards" | "list";

export const PAGE_SIZE = 12;

const TALENT_SORTS = ["name", "experience", "recent"] as const;
const COLLECTIVE_SORTS = ["name", "founded", "members"] as const;
const AVAILABILITY = ["available", "busy", "open_to_offers"] as const;
const ORG_KINDS = ["philharmonic", "theatre", "conservatory", "college", "school", "festival_org", "agency"] as const;

const DEFAULTS: Record<string, string> = { view: "cards", sort: "name", page: "1" };

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

export function str(raw: RawParams, key: string): string | undefined {
  const v = first(raw[key])?.trim();
  return v ? v.slice(0, 100) : undefined;
}

export function oneOf<T extends string>(v: string | undefined, list: readonly T[]): T | undefined {
  return v !== undefined && (list as readonly string[]).includes(v) ? (v as T) : undefined;
}

export function int(v: string | undefined, min: number, max: number): number | undefined {
  if (v === undefined || !/^-?\d+$/.test(v)) return undefined;
  const n = Number(v);
  return n >= min && n <= max ? n : undefined;
}

function bool(v: string | undefined): true | undefined {
  return v === "true" || v === "1" ? true : undefined;
}

export const parsePage = (raw: RawParams): number => int(str(raw, "page"), 1, 100000) ?? 1;
const parseView = (raw: RawParams): View => oneOf(str(raw, "view"), ["cards", "list"] as const) ?? "cards";

/** Faqat aniqlangan (undefined bo'lmagan) kalitlarni qoldiradi */
export function compact<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

function regionAndCity(raw: RawParams): { regionId?: string; city?: string } {
  const regionId = REGIONS.find((r) => r.id === str(raw, "region"))?.id;
  const city = regionId ? REGIONS.find((r) => r.id === regionId)!.cities.find((c) => c === str(raw, "city")) : undefined;
  return { regionId, city };
}

export type TalentParams = {
  filters: TalentFilters;
  page: number;
  view: View;
  sort: (typeof TALENT_SORTS)[number];
  activeCount: number;
};

export function parseTalentParams(kind: TalentKind, raw: RawParams): TalentParams {
  const sort = oneOf(str(raw, "sort"), TALENT_SORTS) ?? "name";
  const { regionId, city } = regionAndCity(raw);
  const voiceId = kind === "vocalist" ? VOICE_TYPES.find((v) => v.id === str(raw, "voice"))?.id : undefined;
  const instrumentId = INSTRUMENTS.find((i) => i.id === str(raw, "instrument"))?.id;
  const minExperience = int(str(raw, "exp"), 1, 60);
  const collectiveId = /^[a-z0-9-]{1,40}$/.test(str(raw, "collective") ?? "") ? str(raw, "collective") : undefined;

  const active = {
    q: str(raw, "q"),
    instrumentId,
    voiceTypeId: voiceId,
    specialty: str(raw, "specialty"),
    regionId,
    city,
    education: str(raw, "education"),
    minExperience,
    collectiveId,
    availability: oneOf(str(raw, "availability"), AVAILABILITY),
    verified: bool(str(raw, "verified")),
  };
  const compacted = compact(active);
  return {
    filters: { kind, ...compacted, sort },
    page: parsePage(raw),
    view: parseView(raw),
    sort,
    activeCount: Object.keys(compacted).length,
  };
}

export type CollectiveParams = {
  filters: CollectiveFilters;
  page: number;
  sort: (typeof COLLECTIVE_SORTS)[number];
  activeCount: number;
};

export function parseCollectiveParams(type: CollectiveType, raw: RawParams): CollectiveParams {
  const sort = oneOf(str(raw, "sort"), COLLECTIVE_SORTS) ?? "name";
  const { regionId, city } = regionAndCity(raw);
  const active = compact({ q: str(raw, "q"), regionId, city, verified: bool(str(raw, "verified")) });
  return { filters: { type, ...active, sort }, page: parsePage(raw), sort, activeCount: Object.keys(active).length };
}

export type OrganizationParams = { filters: OrganizationFilters; page: number; activeCount: number };

export function parseOrganizationParams(raw: RawParams): OrganizationParams {
  const active = compact({
    q: str(raw, "q"),
    kind: oneOf(str(raw, "kind"), ORG_KINDS),
    regionId: REGIONS.find((r) => r.id === str(raw, "region"))?.id,
  });
  return { filters: active, page: parsePage(raw), activeCount: Object.keys(active).length };
}

/**
 * Joriy URL parametrlariga `patch` ni qo'llaydi. `patch` da bo'lmagan `page` olib tashlanadi
 * (filtr o'zgarsa birinchi sahifaga qaytish). Bo'sh va standart qiymatlar yozilmaydi.
 */
export function buildQuery(current: URLSearchParams | RawParams, patch: Record<string, string | undefined>): string {
  const next = new URLSearchParams();
  const entries: [string, string][] =
    current instanceof URLSearchParams
      ? [...current.entries()]
      : Object.entries(current).flatMap(([k, v]) => (v === undefined ? [] : [[k, Array.isArray(v) ? (v[0] ?? "") : v] as [string, string]]));

  for (const [k, v] of entries) if (k !== "page") next.set(k, v);
  if (!("page" in patch)) next.delete("page");
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === "" || DEFAULTS[k] === v) next.delete(k);
    else next.set(k, v);
  }
  const s = next.toString();
  return s ? `?${s}` : "";
}

export function totalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** [1, 'gap', 4, 5, 6, 'gap', 20] ko'rinishidagi sahifalar ro'yxati */
export function buildPageList(current: number, total: number): (number | "gap")[] {
  if (total <= 1) return [1];
  const keep = [...new Set([1, total, current - 1, current, current + 1].filter((n) => n >= 1 && n <= total))].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  keep.forEach((n, i) => {
    const prev = keep[i - 1];
    if (prev !== undefined && n - prev === 2) out.push(prev + 1);
    else if (prev !== undefined && n - prev > 2) out.push("gap");
    out.push(n);
  });
  return out;
}
