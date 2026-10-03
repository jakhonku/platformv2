import type { Paginated } from "../../types/common.ts";
import type { Application, ApplicationPayload, ApplicationStatus, Casting, Requirements, Vacancy } from "../../types/opportunity.ts";
import { MOCK_NOW } from "../mock/now.ts";
import { DataError } from "./errors.ts";
import {
  applicationPayloadSchema,
  applicationStatusSchema,
  castingFiltersSchema,
  parse,
  vacancyFiltersSchema,
  type CastingFilters,
  type VacancyFilters,
} from "./filters.ts";
import { simulateLatency } from "./latency.ts";
import { paginate } from "./paginate.ts";
import { store } from "./store.ts";
import { clone, matches } from "./text.ts";
import type { ApplicantView, ApplicationView, CastingDetail, CastingItem, VacancyDetail, VacancyItem } from "./views.ts";

const orgName = (id: string) => store.organizations.find((o) => o.id === id)?.name ?? "";
const orgOf = (id: string) => store.organizations.find((o) => o.id === id) ?? null;
const countFor = (key: "castingId" | "vacancyId", id: string) => store.applications.filter((a) => a[key] === id).length;

function matchesRequirements(
  req: Requirements,
  orgRegionId: string | undefined,
  f: { instrumentId?: string; voiceTypeId?: string; regionId?: string; kind?: string },
): boolean {
  return (
    (!f.instrumentId || (req.instrumentIds?.includes(f.instrumentId) ?? false)) &&
    (!f.voiceTypeId || (req.voiceTypeIds?.includes(f.voiceTypeId) ?? false)) &&
    (!f.kind || (req.kinds?.includes(f.kind as never) ?? false)) &&
    (!f.regionId || orgRegionId === f.regionId || (req.regionIds?.includes(f.regionId) ?? false))
  );
}

export async function getCastings(filters: CastingFilters = {}, page?: number, pageSize?: number): Promise<Paginated<CastingItem>> {
  await simulateLatency();
  const f = parse(castingFiltersSchema, filters);
  const list = store.castings.filter(
    (c) =>
      matches(f.q, c.title, c.description, orgName(c.organizationId)) &&
      (!f.organizationId || c.organizationId === f.organizationId) &&
      (!f.status || c.status === f.status) &&
      matchesRequirements(c.requirements, orgOf(c.organizationId)?.regionId, f),
  );
  list.sort((a, b) => (f.sort === "recent" ? b.createdAt.localeCompare(a.createdAt) : a.deadline.localeCompare(b.deadline)));
  const result = paginate(list, page, pageSize);
  return {
    ...result,
    items: clone(result.items.map((c) => ({ ...c, organizationName: orgName(c.organizationId), applicantsCount: countFor("castingId", c.id) }))),
  };
}

export async function getCastingById(id: string): Promise<CastingDetail | null> {
  await simulateLatency();
  const c = store.castings.find((x) => x.id === id);
  if (!c) return null;
  return clone({ ...c, organizationName: orgName(c.organizationId), applicantsCount: countFor("castingId", c.id), organization: orgOf(c.organizationId) });
}

export async function getVacancies(filters: VacancyFilters = {}, page?: number, pageSize?: number): Promise<Paginated<VacancyItem>> {
  await simulateLatency();
  const f = parse(vacancyFiltersSchema, filters);
  const list = store.vacancies.filter(
    (v) =>
      matches(f.q, v.title, v.description, orgName(v.organizationId)) &&
      (!f.organizationId || v.organizationId === f.organizationId) &&
      (!f.status || v.status === f.status) &&
      (!f.employment || v.employment === f.employment) &&
      matchesRequirements(v.requirements, v.regionId, f),
  );
  list.sort((a, b) => (f.sort === "recent" ? b.createdAt.localeCompare(a.createdAt) : a.deadline.localeCompare(b.deadline)));
  const result = paginate(list, page, pageSize);
  return {
    ...result,
    items: clone(result.items.map((v) => ({ ...v, organizationName: orgName(v.organizationId), applicantsCount: countFor("vacancyId", v.id) }))),
  };
}

export async function getVacancyById(id: string): Promise<VacancyDetail | null> {
  await simulateLatency();
  const v = store.vacancies.find((x) => x.id === id);
  if (!v) return null;
  return clone({ ...v, organizationName: orgName(v.organizationId), applicantsCount: countFor("vacancyId", v.id), organization: orgOf(v.organizationId) });
}

function submit(target: Casting | Vacancy, key: "castingId" | "vacancyId", payload: ApplicationPayload): Application {
  const p = parse(applicationPayloadSchema, payload);
  if (target.status === "closed" || target.deadline < MOCK_NOW) throw new DataError("closed", "Ariza qabuli yopilgan");
  if (!store.talents.some((t) => t.id === p.talentId)) throw new DataError("not_found", "Iqtidor topilmadi");
  if (store.applications.some((a) => a.talentId === p.talentId && a[key] === target.id)) {
    throw new DataError("duplicate", "Bu iqtidor allaqachon ariza topshirgan");
  }
  const now = new Date().toISOString();
  const app: Application = {
    id: `application-${String(store.applications.length + 1).padStart(2, "0")}`,
    [key]: target.id,
    talentId: p.talentId,
    message: p.message ?? "",
    mediaIds: p.mediaIds ?? [],
    status: "submitted",
    history: [{ status: "submitted", at: now }],
    createdAt: now,
  };
  store.applications.push(app);
  return clone(app);
}

export async function applyToCasting(id: string, payload: ApplicationPayload): Promise<Application> {
  await simulateLatency();
  const casting = store.castings.find((c) => c.id === id);
  if (!casting) throw new DataError("not_found", "Kasting topilmadi");
  return submit(casting, "castingId", payload);
}

export async function applyToVacancy(id: string, payload: ApplicationPayload): Promise<Application> {
  await simulateLatency();
  const vacancy = store.vacancies.find((v) => v.id === id);
  if (!vacancy) throw new DataError("not_found", "Vakansiya topilmadi");
  return submit(vacancy, "vacancyId", payload);
}

export async function getMyApplications(talentId: string): Promise<ApplicationView[]> {
  await simulateLatency();
  return clone(
    store.applications
      .filter((a) => a.talentId === talentId)
      .map((a): ApplicationView => {
        const casting = a.castingId ? store.castings.find((c) => c.id === a.castingId) : undefined;
        const vacancy = a.vacancyId ? store.vacancies.find((v) => v.id === a.vacancyId) : undefined;
        const target = casting ?? vacancy;
        return {
          ...a,
          targetKind: casting ? "casting" : "vacancy",
          title: target?.title ?? "",
          organizationName: target ? orgName(target.organizationId) : "",
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

export async function getApplicantsFor(castingOrVacancyId: string): Promise<ApplicantView[]> {
  await simulateLatency();
  return clone(
    store.applications
      .filter((a) => a.castingId === castingOrVacancyId || a.vacancyId === castingOrVacancyId)
      .map((a) => ({ ...a, talent: store.talents.find((t) => t.id === a.talentId) ?? null })),
  );
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<Application> {
  await simulateLatency();
  const next = parse(applicationStatusSchema, status);
  const app = store.applications.find((a) => a.id === applicationId);
  if (!app) throw new DataError("not_found", "Ariza topilmadi");
  if (app.status !== next) {
    app.status = next;
    app.history.push({ status: next, at: new Date().toISOString() });
  }
  return clone(app);
}
