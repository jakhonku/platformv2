import type { Collective, Organization } from "../../types/collective.ts";
import type { Paginated } from "../../types/common.ts";
import {
  collectiveFiltersSchema,
  organizationFiltersSchema,
  parse,
  type CollectiveFilters,
  type OrganizationFilters,
} from "./filters.ts";
import { simulateLatency } from "./latency.ts";
import { paginate } from "./paginate.ts";
import { store } from "./store.ts";
import { clone, compareText, matches, norm } from "./text.ts";
import type { CollectiveDetail, OrganizationDetail } from "./views.ts";

const visibleCollectives = () => store.collectives.filter((c) => c.moderation === "approved");
const visibleOrgs = () => store.organizations.filter((o) => o.verification === "approved");

export async function getCollectives(
  filters: CollectiveFilters = {},
  page?: number,
  pageSize?: number,
): Promise<Paginated<Collective>> {
  await simulateLatency();
  const f = parse(collectiveFiltersSchema, filters);
  const list = visibleCollectives().filter(
    (c) =>
      (!f.type || c.type === f.type) &&
      matches(f.q, c.name, c.city) &&
      (!f.regionId || c.regionId === f.regionId) &&
      (!f.city || norm(c.city) === norm(f.city)) &&
      (f.verified === undefined || c.verified === f.verified),
  );
  const sort = f.sort ?? "name";
  list.sort((a, b) =>
    sort === "founded" ? a.foundedYear - b.foundedYear : sort === "members" ? b.members.length - a.members.length : compareText(a.name, b.name),
  );
  const result = paginate(list, page, pageSize);
  return { ...result, items: clone(result.items) };
}

function toDetail(c: Collective): CollectiveDetail {
  const conductor = c.conductorId ? (store.talents.find((t) => t.id === c.conductorId) ?? null) : null;
  const memberProfiles = c.members.flatMap((m) => store.talents.find((t) => t.id === m.talentId) ?? []);
  return clone({ ...c, conductor, memberProfiles });
}

export async function getCollectiveBySlug(slug: string): Promise<CollectiveDetail | null> {
  await simulateLatency();
  const found = visibleCollectives().find((c) => c.slug === slug);
  return found ? toDetail(found) : null;
}

/** Kabinet uchun: ko'rinish (moderatsiya) holatidan qat'i nazar jamoa tafsiloti */
export async function getCollectiveDetailById(id: string): Promise<CollectiveDetail | null> {
  await simulateLatency();
  const found = store.collectives.find((c) => c.id === id);
  return found ? toDetail(found) : null;
}

export async function getCollectiveById(id: string): Promise<Collective | null> {
  await simulateLatency();
  const found = store.collectives.find((c) => c.id === id);
  return found ? clone(found) : null;
}

export async function getOrganizations(
  filters: OrganizationFilters = {},
  page?: number,
  pageSize?: number,
): Promise<Paginated<Organization>> {
  await simulateLatency();
  const f = parse(organizationFiltersSchema, filters);
  const list = visibleOrgs().filter(
    (o) => matches(f.q, o.name, o.city) && (!f.kind || o.kind === f.kind) && (!f.regionId || o.regionId === f.regionId),
  );
  list.sort((a, b) => compareText(a.name, b.name));
  const result = paginate(list, page, pageSize);
  return { ...result, items: clone(result.items) };
}

export async function getOrganizationBySlug(slug: string): Promise<OrganizationDetail | null> {
  await simulateLatency();
  const found = visibleOrgs().find((o) => o.slug === slug);
  if (!found) return null;
  return clone({
    ...found,
    castings: store.castings.filter((c) => c.organizationId === found.id),
    vacancies: store.vacancies.filter((v) => v.organizationId === found.id),
  });
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  await simulateLatency();
  const found = store.organizations.find((o) => o.id === id);
  return found ? clone(found) : null;
}
