import { z } from "zod";
import type { AdminStatistics, Banner, ReferenceInput, ReferenceKind, SystemInfo, SystemSettings } from "../../types/admin.ts";
import type { Competition, Festival, NewsItem } from "../../types/content.ts";
import type { User, UserStatus } from "../../types/user.ts";
import { ROLES, type Role } from "../demo/role.ts";
import { MOCK_NOW } from "../mock/now.ts";
import { slugify } from "../mock/names.ts";
import { getAdminStats } from "./admin.ts";
import { logAudit } from "./audit.ts";
import { DataError } from "./errors.ts";
import { simulateLatency } from "./latency.ts";
import { store } from "./store.ts";
import { clone } from "./text.ts";

const DEFAULT_ACTOR = "user-admin";
const invalid = (message = "Maʼlumotlar notoʻgʻri") => new DataError("invalid", message);

function check<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) throw invalid(result.error.message);
  return result.data;
}

const isDate = (v: string) => !Number.isNaN(Date.parse(v));
const date = z.string().refine(isDate, "Sana notoʻgʻri");
/** Faqat loyiha ichidagi rasmlar (next/image tashqi domenlarsiz ishlaydi) */
const localImage = z.string().regex(/^\/placeholders\/[\w.-]+$/, "Rasm manzili notoʻgʻri");

function uniqueSlug(title: string, taken: Set<string>): string {
  const base = slugify(title) || "item";
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

/* --------------------------------- Foydalanuvchilar --------------------------------- */

const activeAdmins = () => store.users.filter((u) => u.roles.includes("admin") && u.status === "active");

function findUser(id: string): User {
  const user = store.users.find((u) => u.id === id);
  if (!user) throw new DataError("not_found", "Foydalanuvchi topilmadi");
  return user;
}

const isLastActiveAdmin = (user: User) => user.roles.includes("admin") && user.status === "active" && activeAdmins().length <= 1;

export async function setUserStatus(userId: string, status: UserStatus, actorId = DEFAULT_ACTOR): Promise<User> {
  await simulateLatency();
  check(z.enum(["active", "pending", "blocked"]), status);
  const user = findUser(userId);
  if (status !== "active" && isLastActiveAdmin(user)) throw new DataError("forbidden", "Oxirgi faol adminni bloklab boʻlmaydi");
  user.status = status;
  logAudit(actorId, `user.${status === "blocked" ? "block" : "status"}`, "user", userId, status);
  return clone(user);
}

export async function setUserRoles(userId: string, roles: Role[], actorId = DEFAULT_ACTOR): Promise<User> {
  await simulateLatency();
  const valid = check(z.array(z.enum(ROLES as unknown as [Role, ...Role[]])).min(1).refine((r) => !r.includes("guest"), "guest tayinlanmaydi"), roles);
  const user = findUser(userId);
  if (isLastActiveAdmin(user) && !valid.includes("admin")) throw new DataError("forbidden", "Oxirgi adminning rolini olib boʻlmaydi");
  user.roles = [...new Set(valid)];
  logAudit(actorId, "user.roles", "user", userId, user.roles.join(", "));
  return clone(user);
}

/* ------------------------------------ E'lonlar ------------------------------------ */

export async function deleteOpening(kind: "casting" | "vacancy", id: string, actorId = DEFAULT_ACTOR): Promise<void> {
  await simulateLatency();
  const list = kind === "casting" ? store.castings : store.vacancies;
  const index = list.findIndex((x) => x.id === id);
  if (index < 0) throw new DataError("not_found", "Eʼlon topilmadi");
  list.splice(index, 1);
  store.applications = store.applications.filter((a) => a.castingId !== id && a.vacancyId !== id);
  logAudit(actorId, `${kind}.delete`, kind, id);
}

/* ---------------------------------- Tadbirlar ---------------------------------- */

const eventStatus = (start: string, end: string): Competition["status"] => (end < MOCK_NOW ? "finished" : start > MOCK_NOW ? "upcoming" : "ongoing");

const regionExists = (id: string) => store.references.regions.some((r) => r.id === id);

const eventBase = {
  id: z.string().optional(),
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(5000),
  regionId: z.string().refine(regionExists, "Hudud notoʻgʻri"),
  city: z.string().trim().min(1).max(80),
  startDate: date,
  endDate: date,
  imageUrl: localImage,
  organizerId: z.string().optional(),
};
const datesOk = (v: { startDate: string; endDate: string }) => v.startDate <= v.endDate;

const competitionSchema = z
  .object({ ...eventBase, deadline: date, categoryId: z.string().refine((id) => store.references.categories.some((c) => c.id === id), "Turkum notoʻgʻri"), prizeFundUzs: z.number().int().min(0).optional() })
  .refine(datesOk, "Sanalar notoʻgʻri");
const festivalSchema = z.object({ ...eventBase, lineup: z.array(z.string().trim().min(1).max(150)).max(50) }).refine(datesOk, "Sanalar notoʻgʻri");

export type CompetitionInput = z.input<typeof competitionSchema>;
export type FestivalInput = z.input<typeof festivalSchema>;

function upsert<T extends { id: string; slug: string; title: string }>(list: T[], input: Omit<T, "id" | "slug" | "status"> & { id?: string }, make: (id: string, slug: string) => T): T {
  const existing = input.id ? list.find((x) => x.id === input.id) : undefined;
  if (input.id && !existing) throw new DataError("not_found", "Yozuv topilmadi");
  const taken = new Set(list.filter((x) => x !== existing).map((x) => x.slug));
  const slug = existing && slugify(existing.title) === slugify(input.title) ? existing.slug : uniqueSlug(input.title, taken);
  const next = make(existing?.id ?? `${list === (store.competitions as unknown) ? "competition" : "festival"}-new-${Date.now().toString(36)}-${list.length + 1}`, slug);
  if (existing) list[list.indexOf(existing)] = next;
  else list.push(next);
  return next;
}

export async function saveCompetition(p: CompetitionInput, actorId = DEFAULT_ACTOR): Promise<Competition> {
  await simulateLatency();
  const v = check(competitionSchema, p);
  const saved = upsert(store.competitions, v, (id, slug) => ({ ...v, id, slug, status: eventStatus(v.startDate, v.endDate) }));
  logAudit(actorId, v.id ? "competition.update" : "competition.create", "competition", saved.id, saved.title);
  return clone(saved);
}

export async function saveFestival(p: FestivalInput, actorId = DEFAULT_ACTOR): Promise<Festival> {
  await simulateLatency();
  const v = check(festivalSchema, p);
  const saved = upsert(store.festivals, v, (id, slug) => ({ ...v, id, slug, status: eventStatus(v.startDate, v.endDate) }));
  logAudit(actorId, v.id ? "festival.update" : "festival.create", "festival", saved.id, saved.title);
  return clone(saved);
}

export async function deleteEvent(kind: "competition" | "festival", id: string, actorId = DEFAULT_ACTOR): Promise<void> {
  await simulateLatency();
  const list = kind === "competition" ? store.competitions : store.festivals;
  const index = list.findIndex((x) => x.id === id);
  if (index < 0) throw new DataError("not_found", "Tadbir topilmadi");
  list.splice(index, 1);
  logAudit(actorId, `${kind}.delete`, kind, id);
}

/* --------------------------------- Yangiliklar --------------------------------- */

const newsSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(5).max(150),
  excerpt: z.string().trim().min(10).max(400),
  body: z.string().trim().min(20).max(10000),
  categoryId: z.string().refine((id) => store.references.categories.some((c) => c.id === id && c.kind === "news"), "Turkum notoʻgʻri"),
  imageUrl: localImage,
});
export type NewsInput = z.input<typeof newsSchema>;

export async function saveNews(p: NewsInput, actorId = DEFAULT_ACTOR): Promise<NewsItem> {
  await simulateLatency();
  const v = check(newsSchema, p);
  const existing = v.id ? store.news.find((n) => n.id === v.id) : undefined;
  if (v.id && !existing) throw new DataError("not_found", "Yangilik topilmadi");
  const taken = new Set(store.news.filter((n) => n !== existing).map((n) => n.slug));
  const slug = existing && slugify(existing.title) === slugify(v.title) ? existing.slug : uniqueSlug(v.title, taken);
  const next: NewsItem = {
    id: existing?.id ?? `news-new-${Date.now().toString(36)}-${store.news.length + 1}`,
    slug,
    title: v.title,
    excerpt: v.excerpt,
    body: v.body,
    categoryId: v.categoryId,
    authorId: existing?.authorId ?? actorId,
    imageUrl: v.imageUrl,
    publishedAt: existing?.publishedAt ?? new Date().toISOString(),
  };
  if (existing) store.news[store.news.indexOf(existing)] = next;
  else store.news.unshift(next);
  logAudit(actorId, existing ? "news.update" : "news.publish", "news", next.id, next.title);
  return clone(next);
}

export async function deleteNews(id: string, actorId = DEFAULT_ACTOR): Promise<void> {
  await simulateLatency();
  const index = store.news.findIndex((n) => n.id === id);
  if (index < 0) throw new DataError("not_found", "Yangilik topilmadi");
  store.news.splice(index, 1);
  logAudit(actorId, "news.delete", "news", id);
}

/* ---------------------------------- Bannerlar ---------------------------------- */

const bannerSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2).max(100),
  link: z.string().trim().refine((v) => v.startsWith("/") || v.startsWith("https://"), "Havola notoʻgʻri"),
  imageUrl: z.union([z.literal(""), localImage]),
  active: z.boolean(),
});
export type BannerInput = z.input<typeof bannerSchema>;

export async function getBanners(): Promise<Banner[]> {
  await simulateLatency();
  return clone(store.banners);
}

export async function saveBanner(p: BannerInput, actorId = DEFAULT_ACTOR): Promise<Banner> {
  await simulateLatency();
  const v = check(bannerSchema, p);
  const existing = v.id ? store.banners.find((b) => b.id === v.id) : undefined;
  if (v.id && !existing) throw new DataError("not_found", "Banner topilmadi");
  const next: Banner = { ...v, id: existing?.id ?? `banner-new-${Date.now().toString(36)}-${store.banners.length + 1}` };
  if (existing) store.banners[store.banners.indexOf(existing)] = next;
  else store.banners.push(next);
  logAudit(actorId, existing ? "banner.update" : "banner.create", "banner", next.id, next.title);
  return clone(next);
}

export async function deleteBanner(id: string, actorId = DEFAULT_ACTOR): Promise<void> {
  await simulateLatency();
  const index = store.banners.findIndex((b) => b.id === id);
  if (index < 0) throw new DataError("not_found", "Banner topilmadi");
  store.banners.splice(index, 1);
  logAudit(actorId, "banner.delete", "banner", id);
}

/* -------------------------------- Spravochniklar -------------------------------- */

const nameSchema = z.object({ uz: z.string().trim().min(1).max(120), ru: z.string().trim().min(1).max(120), en: z.string().trim().min(1).max(120) });

const LISTS = {
  instrument: () => store.references.instruments,
  voiceType: () => store.references.voiceTypes,
  region: () => store.references.regions,
  category: () => store.references.categories,
} as const;

function referenceSchema(kind: ReferenceKind) {
  const base = { id: z.string().optional(), name: nameSchema };
  switch (kind) {
    case "instrument":
      return z.object({ ...base, family: z.enum(["symphonic", "folk", "jazz", "keyboard", "percussion"]) });
    case "voiceType":
      return z.object({ ...base, range: z.object({ low: z.string().regex(/^[A-G][#b]?\d$/), high: z.string().regex(/^[A-G][#b]?\d$/) }) });
    case "region":
      return z.object({ ...base, cities: z.array(z.string().trim().min(1).max(80)).max(100) });
    case "category":
      return z.object({ ...base, kind: z.enum(["talent", "news", "event"]) });
  }
}

export async function saveReference(kind: ReferenceKind, item: ReferenceInput, actorId = DEFAULT_ACTOR): Promise<{ id: string }> {
  await simulateLatency();
  const v = check(referenceSchema(kind), item) as ReferenceInput;
  const list = LISTS[kind]() as { id: string; name: ReferenceInput["name"] }[];
  const existing = v.id ? list.find((x) => x.id === v.id) : undefined;
  if (v.id && !existing) throw new DataError("not_found", "Yozuv topilmadi");
  const id = existing?.id ?? uniqueSlug(v.name.uz, new Set(list.map((x) => x.id)));
  const next = { ...v, id } as (typeof list)[number];
  if (existing) list[list.indexOf(existing)] = next;
  else list.push(next);
  logAudit(actorId, existing ? "reference.update" : "reference.create", kind, id, v.name.uz);
  return { id };
}

export async function deleteReference(kind: ReferenceKind, id: string, actorId = DEFAULT_ACTOR): Promise<void> {
  await simulateLatency();
  const list = LISTS[kind]() as { id: string }[];
  const index = list.findIndex((x) => x.id === id);
  if (index < 0) throw new DataError("not_found", "Yozuv topilmadi");
  list.splice(index, 1);
  logAudit(actorId, "reference.delete", kind, id);
}

/* ------------------------------ Tizim va statistika ------------------------------ */

const settingsSchema = z.object({
  maintenanceMode: z.boolean(),
  allowRegistration: z.boolean(),
  moderationRequired: z.boolean(),
  supportEmail: z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Email notoʻgʻri"),
});

export async function getSystemSettings(): Promise<SystemSettings> {
  await simulateLatency();
  return { ...store.system.settings };
}

export async function saveSystemSettings(s: SystemSettings, actorId = DEFAULT_ACTOR): Promise<SystemSettings> {
  await simulateLatency();
  store.system.settings = check(settingsSchema, s);
  logAudit(actorId, "system.settings", "system", "settings");
  return { ...store.system.settings };
}

export async function getSystemInfo(): Promise<SystemInfo> {
  await simulateLatency();
  return { users: store.users.length, talents: store.talents.length, media: store.media.length, lastBackupAt: store.system.lastBackupAt, version: "0.1.0-prototype" };
}

export async function createBackup(actorId = DEFAULT_ACTOR): Promise<{ filename: string; createdAt: string; json: string }> {
  await simulateLatency();
  const createdAt = new Date().toISOString();
  const json = JSON.stringify(
    {
      createdAt,
      users: store.users,
      talents: store.talents,
      collectives: store.collectives,
      organizations: store.organizations,
      media: store.media,
      castings: store.castings,
      vacancies: store.vacancies,
      applications: store.applications,
    },
    null,
    2,
  );
  store.system.lastBackupAt = createdAt;
  logAudit(actorId, "system.backup", "system", "backup");
  return { filename: `talent-backup-${createdAt.slice(0, 10)}.json`, createdAt, json };
}

export async function getAdminStatistics(): Promise<AdminStatistics> {
  await simulateLatency();
  const approved = store.talents.filter((t) => t.moderation === "approved");
  const count = <K extends string>(keys: K[], pick: (k: K) => number) => keys.map((k) => ({ key: k, n: pick(k) }));
  const kinds = count(["musician", "vocalist", "conductor", "composer"] as const, (k) => approved.filter((t) => t.kind === k).length);
  const statuses = count(["submitted", "viewed", "shortlisted", "invited", "accepted", "rejected"] as const, (k) => store.applications.filter((a) => a.status === k).length);
  const regionCounts = new Map<string, number>();
  for (const t of approved) regionCounts.set(t.regionId, (regionCounts.get(t.regionId) ?? 0) + 1);
  const { monthlyViews, weeklyViews } = await getAdminStats();

  const year = new Date(MOCK_NOW).getUTCFullYear();
  const ageOf = (t: { birthYear?: number }) => (t.birthYear ? year - t.birthYear : null);
  const ageGroup = (age: number | null) => (age === null ? "unknown" : age < 18 ? "under18" : age <= 24 ? "18_24" : age <= 34 ? "25_34" : age <= 44 ? "35_44" : age <= 54 ? "45_54" : "55plus") as AdminStatistics["talentsByAge"][number]["group"];
  const expGroup = (y: number) => (y <= 2 ? "0_2" : y <= 5 ? "3_5" : y <= 10 ? "6_10" : y <= 20 ? "11_20" : "21plus") as AdminStatistics["talentsByExperience"][number]["group"];
  const tally = <K extends string>(items: K[], order: readonly K[]) => order.map((k) => ({ key: k, count: items.filter((x) => x === k).length }));

  const instrumentCounts = new Map<string, number>();
  for (const t of approved) for (const id of t.instrumentIds) instrumentCounts.set(id, (instrumentCounts.get(id) ?? 0) + 1);
  const voiceCounts = new Map<string, number>();
  for (const t of approved) if (t.voiceTypeId) voiceCounts.set(t.voiceTypeId, (voiceCounts.get(t.voiceTypeId) ?? 0) + 1);
  const ages = approved.map(ageOf).filter((x): x is number => x !== null);
  const orgKinds = new Map<string, number>();
  for (const o of store.organizations) if (o.verification === "approved") orgKinds.set(o.kind, (orgKinds.get(o.kind) ?? 0) + 1);
  const people = store.users.filter((u) => !u.roles.includes("admin") && !u.roles.includes("moderator"));

  return {
    talentsByInstrument: [...instrumentCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([instrumentId, count]) => ({ instrumentId, count })),
    talentsByVoice: [...voiceCounts.entries()].sort((a, b) => b[1] - a[1]).map(([voiceTypeId, count]) => ({ voiceTypeId, count })),
    talentsByAge: tally(approved.map((t) => ageGroup(ageOf(t))), ["under18", "18_24", "25_34", "35_44", "45_54", "55plus", "unknown"] as const).filter((x) => x.key !== "unknown" || x.count > 0).map((x) => ({ group: x.key, count: x.count })),
    talentsByExperience: tally(approved.map((t) => expGroup(t.experienceYears)), ["0_2", "3_5", "6_10", "11_20", "21plus"] as const).map((x) => ({ group: x.key, count: x.count })),
    talentsByAvailability: tally(approved.map((t) => t.availability), ["available", "open_to_offers", "busy"] as const).map((x) => ({ availability: x.key, count: x.count })),
    accounts: { verified: people.filter((u) => u.identity?.verified === true).length, unverified: people.filter((u) => u.identity?.verified !== true).length },
    collectivesByType: tally(store.collectives.filter((c) => c.moderation === "approved").map((c) => c.type), ["orchestra", "choir"] as const).map((x) => ({ type: x.key, count: x.count })),
    organizationsByKind: [...orgKinds.entries()].sort((a, b) => b[1] - a[1]).map(([kind, count]) => ({ kind, count })),
    openings: {
      castingsOpen: store.castings.filter((c) => c.status === "open").length,
      castingsClosed: store.castings.filter((c) => c.status === "closed").length,
      vacanciesOpen: store.vacancies.filter((v) => v.status === "open").length,
      vacanciesClosed: store.vacancies.filter((v) => v.status === "closed").length,
    },
    appealsByStatus: tally(store.appeals.map((x) => x.status), ["new", "in_review", "answered", "returned", "closed"] as const).map((x) => ({ status: x.key, count: x.count })),
    averages: {
      age: ages.length ? Math.round(ages.reduce((n, x) => n + x, 0) / ages.length) : null,
      experience: approved.length ? Math.round(approved.reduce((n, t) => n + t.experienceYears, 0) / approved.length) : 0,
    },
    talentsByKind: kinds.map((x) => ({ kind: x.key, count: x.n })),
    applicationsByStatus: statuses.map((x) => ({ status: x.key, count: x.n })),
    topRegions: [...regionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([regionId, n]) => ({ regionId, count: n })),
    monthlyViews,
    weeklyViews,
  };
}
