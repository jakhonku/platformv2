import type { Paginated } from "../../types/common.ts";
import type { AdminStats, AuditLogEntry } from "../../types/system.ts";
import type { User } from "../../types/user.ts";
import { createRng } from "../mock/random.ts";
import { DataError } from "./errors.ts";
import { parse, userFiltersSchema, type UserFilters } from "./filters.ts";
import { simulateLatency } from "./latency.ts";
import { paginate } from "./paginate.ts";
import { store } from "./store.ts";
import { clone, matches } from "./text.ts";
import type { Collective, Organization } from "../../types/collective.ts";
import type { MediaItem } from "../../types/media.ts";
import type { TalentProfile } from "../../types/talent.ts";
import { logAudit } from "./audit.ts";
import type { ModerationItem, ModerationKind, ModerationMeta } from "./views.ts";

export async function getAdminStats(): Promise<AdminStats> {
  await simulateLatency();
  const rng = createRng(2026);
  const monthlyViews = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(2025, 9 + i, 1));
    return { month: d.toISOString().slice(0, 7), views: 8000 + i * 650 + rng.int(0, 1800) };
  });
  return {
    users: store.users.length,
    talents: store.talents.filter((t) => t.moderation === "approved").length,
    collectives: store.collectives.length,
    organizations: store.organizations.filter((o) => o.verification === "approved").length,
    castingsOpen: store.castings.filter((c) => c.status === "open").length,
    applications: store.applications.length,
    pendingModeration:
      store.talents.filter((t) => t.moderation === "pending").length +
      store.media.filter((m) => m.moderation === "pending").length +
      store.organizations.filter((o) => o.verification === "pending").length +
      store.collectives.filter((c) => c.moderation === "pending").length,
    monthlyViews,
  };
}

export async function getAuditLog(page?: number, pageSize?: number): Promise<Paginated<AuditLogEntry>> {
  await simulateLatency();
  const result = paginate(store.audit, page, pageSize);
  return { ...result, items: clone(result.items) };
}

export async function getUsers(filters: UserFilters = {}, page?: number, pageSize?: number): Promise<Paginated<User>> {
  await simulateLatency();
  const f = parse(userFiltersSchema, filters);
  const list = store.users
    .filter(
      (u) =>
        matches(f.q, u.fullName, u.email, u.phone) &&
        (!f.role || u.roles.includes(f.role as never)) &&
        (!f.status || u.status === f.status),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const result = paginate(list, page, pageSize);
  return { ...result, items: clone(result.items) };
}

const ownerMeta = (userId?: string): ModerationMeta => {
  const user = userId ? store.users.find((u) => u.id === userId) : undefined;
  return user?.identity ? { identity: user.identity.source, identityType: user.identity.type, stir: user.identity.stir, owner: user.fullName } : { owner: user?.fullName };
};

const toItem = {
  profile: (t: TalentProfile): ModerationItem => ({ id: t.id, kind: "profile", title: t.fullName, subtitle: t.specialty, status: t.moderation, submittedAt: t.createdAt, payload: t, meta: ownerMeta(t.userId) }),
  media: (m: MediaItem): ModerationItem => ({ id: m.id, kind: "media", title: m.title, subtitle: m.type, status: m.moderation, submittedAt: m.createdAt, payload: m }),
  organization: (o: Organization): ModerationItem => ({ id: o.id, kind: "organization", title: o.name, subtitle: o.kind, status: o.verification, submittedAt: o.createdAt, payload: o, meta: { ...ownerMeta(o.ownerUserId), stir: o.stir ?? ownerMeta(o.ownerUserId).stir, documents: o.documents } }),
  collective: (c: Collective): ModerationItem => ({ id: c.id, kind: "collective", title: c.name, subtitle: c.type, status: c.moderation, submittedAt: c.foundedYear ? `${c.foundedYear}-01-01T00:00:00.000Z` : new Date().toISOString(), payload: c, meta: { ...ownerMeta(c.ownerUserId), documents: c.documents } }),
};

function queueFor(kind: ModerationKind): ModerationItem[] {
  switch (kind) {
    case "profile":
      return store.talents.filter((t) => t.moderation === "pending").map(toItem.profile);
    case "media":
      return store.media.filter((m) => m.moderation === "pending").map(toItem.media);
    case "organization":
      return store.organizations.filter((o) => o.verification === "pending").map(toItem.organization);
    case "collective":
      return store.collectives.filter((c) => c.moderation === "pending").map(toItem.collective);
  }
}

export async function getModerationQueue(kind: ModerationKind): Promise<ModerationItem[]> {
  await simulateLatency();
  return clone(queueFor(kind));
}

/** Rad etilsa sabab egasiga ko`rinadi (`moderationNote`); tasdiqlansa tozalanadi */
export async function moderate(
  kind: ModerationKind,
  id: string,
  decision: "approved" | "rejected",
  reason?: string,
  actorId = "user-moderator",
): Promise<ModerationItem> {
  await simulateLatency();
  if (decision !== "approved" && decision !== "rejected") throw new DataError("invalid", "Notoʻgʻri qaror");
  if (decision === "rejected" && (reason?.trim().length ?? 0) < 5) throw new DataError("invalid", "Rad etish sababi kamida 5 belgi boʻlsin");
  const note = decision === "rejected" ? reason!.trim() : undefined;

  let item: ModerationItem | undefined;
  if (kind === "profile") {
    const t = store.talents.find((x) => x.id === id);
    if (t) {
      t.moderation = decision;
      t.moderationNote = note;
      // OneID orqali shaxsi tasdiqlangan egaga "verified" belgisi tasdiqlash bilan beriladi
      if (decision === "approved" && store.users.find((u) => u.id === t.userId)?.identity?.verified) t.verified = true;
      item = toItem.profile(t);
    }
  } else if (kind === "media") {
    const m = store.media.find((x) => x.id === id);
    if (m) {
      m.moderation = decision;
      item = toItem.media(m);
    }
  } else if (kind === "organization") {
    const o = store.organizations.find((x) => x.id === id);
    if (o) {
      o.verification = decision;
      o.moderationNote = note;
      item = toItem.organization(o);
    }
  } else {
    const c = store.collectives.find((x) => x.id === id);
    if (c) {
      c.moderation = decision;
      c.moderationNote = note;
      if (decision === "approved" && c.ownerUserId && store.users.find((u) => u.id === c.ownerUserId)?.identity?.verified) c.verified = true;
      item = toItem.collective(c);
    }
  }
  if (!item) throw new DataError("not_found", "Yozuv topilmadi");

  logAudit(actorId, `${kind}.${decision === "approved" ? "approve" : "reject"}`, kind === "profile" ? "talent" : kind, id, reason);
  return clone(item);
}
