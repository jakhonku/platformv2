import type { AuditLogEntry } from "../../types/system.ts";
import { CASTINGS } from "./castings.ts";
import { MEDIA } from "./media.ts";
import { NEWS } from "./news.ts";
import { iso } from "./now.ts";
import { ORGANIZATIONS } from "./organizations.ts";
import { createRng } from "./random.ts";
import { TALENTS } from "./talents.ts";
import { USERS } from "./users.ts";

const rng = createRng(1357);

type Kind = { action: string; entityType: string; ids: string[]; detail: string };

const KINDS: Kind[] = [
  { action: "profile.approve", entityType: "talent", ids: TALENTS.map((t) => t.id), detail: "Profil tasdiqlandi" },
  { action: "media.approve", entityType: "media", ids: MEDIA.map((m) => m.id), detail: "Media fayl tasdiqlandi" },
  { action: "media.reject", entityType: "media", ids: MEDIA.map((m) => m.id), detail: "Sifat talabiga mos kelmadi" },
  { action: "organization.approve", entityType: "organization", ids: ORGANIZATIONS.map((o) => o.id), detail: "Tashkilot tasdiqlandi" },
  { action: "user.block", entityType: "user", ids: USERS.map((u) => u.id), detail: "Qoidabuzarlik tufayli bloklandi" },
  { action: "casting.close", entityType: "casting", ids: CASTINGS.map((c) => c.id), detail: "Muddat tugadi" },
  { action: "news.publish", entityType: "news", ids: NEWS.map((n) => n.id), detail: "Yangilik chop etildi" },
];
const ACTORS = USERS.filter((u) => u.roles.includes("admin") || u.roles.includes("moderator")).map((u) => u.id);

export const AUDIT_LOG: AuditLogEntry[] = Array.from({ length: 36 }, (_, i) => {
  const kind = KINDS[i % KINDS.length];
  return {
    id: `audit-${String(i + 1).padStart(3, "0")}`,
    actorId: ACTORS[i % ACTORS.length],
    action: kind.action,
    entityType: kind.entityType,
    entityId: kind.ids[(i * 3) % kind.ids.length],
    details: kind.detail,
    // Yangisi birinchi, qadamlar qat'iy kamayadi
    at: new Date(Date.parse(iso(2026, 10, 2, 17)) - (i * 5 + rng.int(0, 4)) * 3600000).toISOString(),
  };
});
