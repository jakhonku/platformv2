import { z } from "zod";
import type { Collective, CollectiveInvite, Organization } from "../../types/collective.ts";
import type { Invitation } from "../../types/invitation.ts";
import type { Collection, MediaItem } from "../../types/media.ts";
import type { Casting, Requirements, Vacancy } from "../../types/opportunity.ts";
import type { NotificationChannel } from "../../types/system.ts";
import type { TalentProfile } from "../../types/talent.ts";
import { REGIONS } from "../constants/index.ts";
import { MOCK_NOW } from "../mock/now.ts";
import { createRng } from "../mock/random.ts";
import { parseYoutubeId, validateUpload, type UploadKind } from "../upload.ts";
import { DataError } from "./errors.ts";
import { simulateLatency } from "./latency.ts";
import { store } from "./store.ts";
import { clone } from "./text.ts";

const invalid = (message = "Maʼlumotlar notoʻgʻri") => new DataError("invalid", message);

function check<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) throw invalid(result.error.message);
  return result.data;
}

const isDate = (v: string) => !Number.isNaN(Date.parse(v));
const date = z.string().refine(isDate, "Sana notoʻgʻri");
const region = z.string().refine((v) => REGIONS.some((r) => r.id === v), "Hudud notoʻgʻri");

/* ----------------------------- Iqtidor profili ----------------------------- */

const contactsSchema = z.object({
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().max(120).optional(),
  telegram: z.string().trim().max(60).optional(),
  website: z.string().trim().max(200).optional(),
});

const entry = z.object({ institution: z.string().trim().min(1).max(120), degree: z.string().trim().max(120), yearFrom: z.number().int().min(1950).max(2100), yearTo: z.number().int().min(1950).max(2100).optional() });
const job = z.object({ organization: z.string().trim().min(1).max(120), position: z.string().trim().max(120), yearFrom: z.number().int().min(1950).max(2100), yearTo: z.number().int().min(1950).max(2100).optional() });

const profilePatchSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    specialty: z.string().trim().min(2).max(120),
    bio: z.string().max(2000),
    regionId: region,
    city: z.string().trim().min(1).max(80),
    instrumentIds: z.array(z.string()).max(10),
    voiceTypeId: z.string().optional(),
    education: z.array(entry).max(20),
    experience: z.array(job).max(30),
    experienceYears: z.number().int().min(0).max(70),
    availability: z.enum(["available", "busy", "open_to_offers"]),
    repertoire: z.array(z.string().trim().min(1).max(120)).max(50),
    contacts: contactsSchema,
  })
  .partial()
  .strict();

export type TalentProfilePatch = z.input<typeof profilePatchSchema>;

export async function updateTalentProfile(talentId: string, patch: TalentProfilePatch): Promise<TalentProfile> {
  await simulateLatency();
  const talent = store.talents.find((t) => t.id === talentId);
  if (!talent) throw new DataError("not_found", "Profil topilmadi");
  Object.assign(talent, check(profilePatchSchema, patch));
  return clone(talent);
}

/* --------------------------------- Portfolio -------------------------------- */

const ownerExists = (ownerId: string, ownerType: "talent" | "collective") =>
  ownerType === "talent" ? store.talents.some((t) => t.id === ownerId) : store.collectives.some((c) => c.id === ownerId);

const titleSchema = z.string().trim().min(2).max(120);
const descSchema = z.string().trim().max(1000);

export type AddMediaPayload = { kind: UploadKind; title: string; description: string; fileName?: string; sizeBytes?: number; youtube?: string };

export async function addMedia(ownerId: string, ownerType: "talent" | "collective", p: AddMediaPayload): Promise<MediaItem> {
  await simulateLatency();
  if (!ownerExists(ownerId, ownerType)) throw new DataError("not_found", "Egasi topilmadi");
  const title = check(titleSchema, p.title);
  const description = check(descSchema, p.description);
  const base = { ownerId, ownerType, title, description, moderation: "pending" as const, views: 0, createdAt: new Date().toISOString() };
  const id = `media-new-${String(store.media.length + 1).padStart(3, "0")}`;

  let item: MediaItem;
  if (p.youtube?.trim()) {
    const youtubeId = parseYoutubeId(p.youtube);
    if (!youtubeId) throw invalid("YouTube havolasi notoʻgʻri");
    item = { ...base, id, type: "video", url: `https://www.youtube.com/watch?v=${youtubeId}`, youtubeId };
  } else {
    const verdict = validateUpload(p.kind, p.fileName ?? "", p.sizeBytes ?? 0);
    if (!verdict.ok) throw invalid(`Fayl notoʻgʻri: ${verdict.reason}`);
    item = { ...base, id, type: p.kind, url: `/uploads/${encodeURIComponent(p.fileName!)}` };
  }
  store.media.push(item);
  return clone(item);
}

export async function updateMedia(id: string, p: { title: string; description: string }): Promise<MediaItem> {
  await simulateLatency();
  const item = store.media.find((m) => m.id === id);
  if (!item) throw new DataError("not_found", "Material topilmadi");
  item.title = check(titleSchema, p.title);
  item.description = check(descSchema, p.description);
  return clone(item);
}

export async function deleteMedia(id: string): Promise<void> {
  await simulateLatency();
  const index = store.media.findIndex((m) => m.id === id);
  if (index < 0) throw new DataError("not_found", "Material topilmadi");
  store.media.splice(index, 1);
  for (const c of store.collections) c.itemIds = c.itemIds.filter((x) => x !== id);
}

export async function createCollection(ownerId: string, p: { title: string; description: string; itemIds: string[] }): Promise<Collection> {
  await simulateLatency();
  const title = check(z.string().trim().min(2).max(80), p.title);
  const description = check(descSchema, p.description);
  const ownMedia = new Set(store.media.filter((m) => m.ownerId === ownerId).map((m) => m.id));
  if (p.itemIds.some((i) => !ownMedia.has(i))) throw invalid("Material egasiga tegishli emas");
  const collection: Collection = { id: `collection-new-${String(store.collections.length + 1).padStart(3, "0")}`, ownerId, title, description, itemIds: [...new Set(p.itemIds)] };
  store.collections.push(collection);
  return clone(collection);
}

export async function deleteCollection(id: string): Promise<void> {
  await simulateLatency();
  const index = store.collections.findIndex((c) => c.id === id);
  if (index < 0) throw new DataError("not_found", "Toʻplam topilmadi");
  store.collections.splice(index, 1);
}

export type PortfolioStats = {
  totalViews: number;
  items: { id: string; title: string; views: number }[];
  monthly: { month: string; views: number }[];
};

/** Oylik taqsimot deterministik: jami ko'rishlar 12 oyga ownerId'ga bog'liq og'irliklar bilan bo'linadi */
export async function getPortfolioStats(ownerId: string): Promise<PortfolioStats> {
  await simulateLatency();
  const media = store.media.filter((m) => m.ownerId === ownerId);
  const totalViews = media.reduce((n, m) => n + m.views, 0);
  const items = media
    .map((m) => ({ id: m.id, title: m.title, views: m.views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  let seed = 7;
  for (const ch of ownerId) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rng = createRng(seed);
  const weights = Array.from({ length: 12 }, () => rng.int(5, 15));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const base = new Date(MOCK_NOW);
  const monthly = weights.map((w, i) => {
    const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() - 11 + i, 1));
    return { month: d.toISOString().slice(0, 7), views: Math.floor((totalViews * w) / weightSum) };
  });
  monthly[11].views += totalViews - monthly.reduce((n, m) => n + m.views, 0);
  return { totalViews, items, monthly };
}

/* ------------------------- Takliflar va bildirishnomalar ------------------------- */

export async function getInvitationsFor(talentId: string): Promise<Invitation[]> {
  await simulateLatency();
  return clone(store.invitations.filter((i) => i.talentId === talentId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function respondToInvitation(id: string, status: "accepted" | "declined"): Promise<Invitation> {
  await simulateLatency();
  const found = store.invitations.find((i) => i.id === id);
  if (!found) throw new DataError("not_found", "Taklif topilmadi");
  if (status !== "accepted" && status !== "declined") throw invalid();
  found.status = status;
  return clone(found);
}

const DEFAULT_SETTINGS: Record<NotificationChannel, boolean> = { internal: true, email: true, sms: true, telegram: true };

export async function getNotificationSettings(userId: string): Promise<Record<NotificationChannel, boolean>> {
  await simulateLatency();
  return { ...DEFAULT_SETTINGS, ...store.settings[userId] };
}

export async function saveNotificationSettings(userId: string, s: Record<NotificationChannel, boolean>): Promise<Record<NotificationChannel, boolean>> {
  await simulateLatency();
  const parsed = check(z.object({ internal: z.boolean(), email: z.boolean(), sms: z.boolean(), telegram: z.boolean() }), s);
  store.settings[userId] = parsed;
  return { ...parsed };
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  await simulateLatency();
  let count = 0;
  for (const n of store.notifications) {
    if (n.userId === userId && !n.read) {
      n.read = true;
      count++;
    }
  }
  return count;
}

/* ---------------------------- Tashkilot: e'lonlar ---------------------------- */

const requirementsSchema = z
  .object({
    kinds: z.array(z.enum(["musician", "vocalist", "conductor", "composer"])).optional(),
    instrumentIds: z.array(z.string()).optional(),
    voiceTypeIds: z.array(z.string()).optional(),
    regionIds: z.array(z.string()).optional(),
    minExperience: z.number().int().min(0).max(60).optional(),
  })
  .default({});

const openingBase = {
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(20).max(5000),
  deadline: date.refine((v) => v > MOCK_NOW, "Muddat oʻtib ketgan"),
  requirements: requirementsSchema,
};

export type CastingPayload = { title: string; description: string; location: string; eventDate: string; deadline: string; requirements?: Requirements };
export type VacancyPayload = {
  title: string;
  description: string;
  employment: "full_time" | "part_time" | "contract";
  regionId: string;
  city: string;
  salaryFromUzs?: number;
  salaryToUzs?: number;
  deadline: string;
  requirements?: Requirements;
};

const castingSchema = z.object({ ...openingBase, location: z.string().trim().min(2).max(150), eventDate: date });
const vacancySchema = z
  .object({
    ...openingBase,
    employment: z.enum(["full_time", "part_time", "contract"]),
    regionId: region,
    city: z.string().trim().min(1).max(80),
    salaryFromUzs: z.number().int().min(0).optional(),
    salaryToUzs: z.number().int().min(0).optional(),
  })
  .refine((v) => v.salaryFromUzs === undefined || v.salaryToUzs === undefined || v.salaryFromUzs <= v.salaryToUzs, "Maosh oraligʻi notoʻgʻri");

/** Tashkilot topilmasa not_found, tasdiqlanmagan bo'lsa forbidden (moderator tasdig'igacha e'lon yaratib bo'lmaydi) */
function requireVerifiedOrg(id: string): void {
  const org = store.organizations.find((o) => o.id === id);
  if (!org) throw new DataError("not_found", "Tashkilot topilmadi");
  if (org.verification !== "approved") throw new DataError("forbidden", "Tashkilot hali tasdiqlanmagan");
}

export async function createCasting(orgId: string, p: CastingPayload): Promise<Casting> {
  await simulateLatency();
  requireVerifiedOrg(orgId);
  const v = check(castingSchema, p);
  const now = new Date().toISOString();
  const casting: Casting = { id: `casting-${String(store.castings.length + 1).padStart(2, "0")}`, organizationId: orgId, ...v, status: "open", createdAt: now };
  store.castings.push(casting);
  return clone(casting);
}

export async function createVacancy(orgId: string, p: VacancyPayload): Promise<Vacancy> {
  await simulateLatency();
  requireVerifiedOrg(orgId);
  const v = check(vacancySchema, p);
  const now = new Date().toISOString();
  const vacancy: Vacancy = { id: `vacancy-${String(store.vacancies.length + 1).padStart(2, "0")}`, organizationId: orgId, ...v, status: "open", createdAt: now };
  store.vacancies.push(vacancy);
  return clone(vacancy);
}

export async function setOpportunityStatus(kind: "casting" | "vacancy", id: string, status: "open" | "closed"): Promise<Casting | Vacancy> {
  await simulateLatency();
  if (status !== "open" && status !== "closed") throw invalid();
  const found = (kind === "casting" ? store.castings : store.vacancies).find((x) => x.id === id);
  if (!found) throw new DataError("not_found", "Eʼlon topilmadi");
  found.status = status;
  return clone(found);
}

/* ---------------------------------- Jamoa ---------------------------------- */

const findCollective = (id: string): Collective => {
  const c = store.collectives.find((x) => x.id === id);
  if (!c) throw new DataError("not_found", "Jamoa topilmadi");
  return c;
};

export async function updateCollective(id: string, p: { description: string; repertoire: string[]; contacts: z.input<typeof contactsSchema>; city?: string; regionId?: string }): Promise<Collective> {
  await simulateLatency();
  const c = findCollective(id);
  const v = check(z.object({ description: z.string().trim().min(10).max(3000), repertoire: z.array(z.string().trim().min(1).max(120)).max(50), contacts: contactsSchema, city: z.string().trim().min(1).max(80).optional(), regionId: region.optional() }), p);
  Object.assign(c, v);
  return clone(c);
}

export async function addCollectiveMember(id: string, p: { talentId: string; section: string }): Promise<Collective> {
  await simulateLatency();
  const c = findCollective(id);
  const section = check(z.string().trim().min(1).max(60), p.section);
  if (!store.talents.some((t) => t.id === p.talentId && t.moderation === "approved")) throw new DataError("not_found", "Iqtidor topilmadi");
  if (c.members.some((m) => m.talentId === p.talentId)) throw new DataError("duplicate", "Iqtidor allaqachon aʼzo");
  c.members.push({ talentId: p.talentId, section });
  return clone(c);
}

export async function removeCollectiveMember(id: string, talentId: string): Promise<Collective> {
  await simulateLatency();
  const c = findCollective(id);
  c.members = c.members.filter((m) => m.talentId !== talentId);
  return clone(c);
}

export async function addCollectiveEvent(id: string, p: { title: string; date: string; venue: string }): Promise<Collective> {
  await simulateLatency();
  const c = findCollective(id);
  const v = check(z.object({ title: z.string().trim().min(2).max(150), date, venue: z.string().trim().min(2).max(150) }), p);
  c.events.push({ id: `event-new-${String(c.events.length + 1).padStart(3, "0")}-${c.id}`, ...v });
  return clone(c);
}

export async function removeCollectiveEvent(id: string, eventId: string): Promise<Collective> {
  await simulateLatency();
  const c = findCollective(id);
  c.events = c.events.filter((e) => e.id !== eventId);
  return clone(c);
}

/* ------------------------------ Jamoa a'zoligi (taklif / qabul) ------------------------------ */

export async function inviteCollectiveMember(id: string, p: { talentId: string; section: string }): Promise<CollectiveInvite> {
  await simulateLatency();
  const c = findCollective(id);
  const section = check(z.string().trim().min(1).max(60), p.section);
  if (!store.talents.some((t) => t.id === p.talentId && t.moderation === "approved")) throw new DataError("not_found", "Iqtidor topilmadi");
  if (c.members.some((m) => m.talentId === p.talentId)) throw new DataError("duplicate", "Iqtidor allaqachon aʼzo");
  if (store.collectiveInvites.some((i) => i.collectiveId === id && i.talentId === p.talentId && i.status === "pending")) throw new DataError("duplicate", "Taklif allaqachon yuborilgan");
  const invite: CollectiveInvite = { id: `collective-invite-${Date.now().toString(36)}-${store.collectiveInvites.length + 1}`, collectiveId: id, talentId: p.talentId, section, status: "pending", createdAt: new Date().toISOString() };
  store.collectiveInvites.push(invite);
  return clone(invite);
}

export async function getCollectiveInvitesOf(collectiveId: string): Promise<CollectiveInvite[]> {
  await simulateLatency();
  return clone(store.collectiveInvites.filter((i) => i.collectiveId === collectiveId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function getCollectiveInvitesFor(talentId: string): Promise<(CollectiveInvite & { collectiveName: string })[]> {
  await simulateLatency();
  return clone(
    store.collectiveInvites
      .filter((i) => i.talentId === talentId)
      .map((i) => ({ ...i, collectiveName: store.collectives.find((c) => c.id === i.collectiveId)?.name ?? "" }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

/** Iqtidor qabul qilsa jamoaga a'zo bo'ladi; rad etsa hech narsa qo'shilmaydi */
export async function respondToCollectiveInvite(id: string, status: "accepted" | "declined"): Promise<CollectiveInvite> {
  await simulateLatency();
  const invite = store.collectiveInvites.find((i) => i.id === id);
  if (!invite) throw new DataError("not_found", "Taklif topilmadi");
  if (status !== "accepted" && status !== "declined") throw invalid();
  if (invite.status !== "pending") throw invalid("Taklif allaqachon javob olgan");
  invite.status = status;
  if (status === "accepted") {
    const c = findCollective(invite.collectiveId);
    if (!c.members.some((m) => m.talentId === invite.talentId)) c.members.push({ talentId: invite.talentId, section: invite.section });
    const talent = store.talents.find((t) => t.id === invite.talentId);
    if (talent) talent.currentCollectiveId = invite.collectiveId;
  }
  return clone(invite);
}

/* ----------------------------- Tashkilot profili ----------------------------- */

export async function updateOrganization(id: string, p: { description: string; city: string; regionId: string; contacts: z.input<typeof contactsSchema> }): Promise<Organization> {
  await simulateLatency();
  const org = store.organizations.find((o) => o.id === id);
  if (!org) throw new DataError("not_found", "Tashkilot topilmadi");
  const v = check(z.object({ description: z.string().trim().min(10).max(3000), city: z.string().trim().min(1).max(80), regionId: region, contacts: contactsSchema }), p);
  Object.assign(org, v);
  return clone(org);
}
