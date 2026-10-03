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
import type { ModerationItem, ModerationKind } from "./views.ts";

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
      store.organizations.filter((o) => o.verification === "pending").length,
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

function queueFor(kind: ModerationKind): ModerationItem[] {
  if (kind === "profile") {
    return store.talents
      .filter((t) => t.moderation === "pending")
      .map((t) => ({ id: t.id, kind, title: t.fullName, subtitle: t.specialty, status: t.moderation, submittedAt: t.createdAt, payload: t }));
  }
  if (kind === "media") {
    return store.media
      .filter((m) => m.moderation === "pending")
      .map((m) => ({ id: m.id, kind, title: m.title, subtitle: m.type, status: m.moderation, submittedAt: m.createdAt, payload: m }));
  }
  return store.organizations
    .filter((o) => o.verification === "pending")
    .map((o) => ({ id: o.id, kind, title: o.name, subtitle: o.kind, status: o.verification, submittedAt: o.createdAt, payload: o }));
}

export async function getModerationQueue(kind: ModerationKind): Promise<ModerationItem[]> {
  await simulateLatency();
  return clone(queueFor(kind));
}

export async function moderate(
  kind: ModerationKind,
  id: string,
  decision: "approved" | "rejected",
  reason?: string,
  actorId = "user-moderator",
): Promise<ModerationItem> {
  await simulateLatency();
  if (decision !== "approved" && decision !== "rejected") throw new DataError("invalid", "Notoʻgʻri qaror");

  let item: ModerationItem | undefined;
  if (kind === "profile") {
    const t = store.talents.find((x) => x.id === id);
    if (t) {
      t.moderation = decision;
      item = { id: t.id, kind, title: t.fullName, subtitle: t.specialty, status: t.moderation, submittedAt: t.createdAt, payload: t };
    }
  } else if (kind === "media") {
    const m = store.media.find((x) => x.id === id);
    if (m) {
      m.moderation = decision;
      item = { id: m.id, kind, title: m.title, subtitle: m.type, status: m.moderation, submittedAt: m.createdAt, payload: m };
    }
  } else {
    const o = store.organizations.find((x) => x.id === id);
    if (o) {
      o.verification = decision;
      item = { id: o.id, kind, title: o.name, subtitle: o.kind, status: o.verification, submittedAt: o.createdAt, payload: o };
    }
  }
  if (!item) throw new DataError("not_found", "Yozuv topilmadi");

  store.audit.unshift({
    id: `audit-${String(store.audit.length + 1).padStart(3, "0")}`,
    actorId,
    action: `${kind}.${decision === "approved" ? "approve" : "reject"}`,
    entityType: kind === "profile" ? "talent" : kind,
    entityId: id,
    details: reason,
    at: new Date().toISOString(),
  });
  return clone(item);
}
