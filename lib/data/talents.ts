import type { Paginated } from "../../types/common.ts";
import type { TalentProfile } from "../../types/talent.ts";
import { talentFiltersSchema, parse, type TalentFilters } from "./filters.ts";
import { simulateLatency } from "./latency.ts";
import { paginate } from "./paginate.ts";
import { store } from "./store.ts";
import { clone, compareText, matches, norm } from "./text.ts";

const visible = () => store.talents.filter((t) => t.moderation === "approved");

export async function getTalents(
  filters: TalentFilters = {},
  page?: number,
  pageSize?: number,
): Promise<Paginated<TalentProfile>> {
  await simulateLatency();
  const f = parse(talentFiltersSchema, filters);

  const list = visible().filter(
    (t) =>
      (!f.kind || t.kind === f.kind) &&
      matches(f.q, t.fullName, t.specialty, t.city) &&
      (!f.instrumentId || t.instrumentIds.includes(f.instrumentId)) &&
      (!f.voiceTypeId || t.voiceTypeId === f.voiceTypeId) &&
      matches(f.specialty, t.specialty) &&
      (!f.regionId || t.regionId === f.regionId) &&
      (!f.city || norm(t.city) === norm(f.city)) &&
      (!f.education || t.education.some((e) => norm(e.institution).includes(norm(f.education!)))) &&
      (f.minExperience === undefined || t.experienceYears >= f.minExperience) &&
      (!f.collectiveId || t.currentCollectiveId === f.collectiveId) &&
      (!f.availability || t.availability === f.availability) &&
      (f.verified === undefined || t.verified === f.verified),
  );

  const sort = f.sort ?? "name";
  list.sort((a, b) =>
    sort === "experience"
      ? b.experienceYears - a.experienceYears || compareText(a.fullName, b.fullName)
      : sort === "recent"
        ? b.createdAt.localeCompare(a.createdAt)
        : compareText(a.fullName, b.fullName),
  );

  const result = paginate(list, page, pageSize);
  return { ...result, items: clone(result.items) };
}

export async function getTalentBySlug(slug: string): Promise<TalentProfile | null> {
  await simulateLatency();
  const found = visible().find((t) => t.slug === slug);
  return found ? clone(found) : null;
}

export async function getTalentById(id: string): Promise<TalentProfile | null> {
  await simulateLatency();
  const found = store.talents.find((t) => t.id === id);
  return found ? clone(found) : null;
}

export async function getFeaturedTalents(limit = 8): Promise<TalentProfile[]> {
  await simulateLatency();
  const n = Math.min(24, Math.max(1, Math.floor(Number(limit)) || 8));
  return clone(visible().filter((t) => t.featured && t.verified).slice(0, n));
}
