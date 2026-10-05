import { z } from "zod";
import { parseContact } from "../auth/contact.ts";
import { MAX_IMPORT_ROWS, type MemberRow } from "../import/members.ts";
import { logAudit } from "./audit.ts";
import { DataError } from "./errors.ts";
import { simulateLatency } from "./latency.ts";
import { store } from "./store.ts";

const DEFAULT_ACTOR = "user-admin";
const digits = (s: string): string => s.replace(/\D/g, "");

export type ImportSummary = {
  /** Platformada topilgan iqtidorlar (jamoa: taklif yuborildi; tashkilot: xodimga bog'landi) */
  matched: number;
  /** Platformada hali yo'q: ro'yxatdan o'tmagan a'zo/xodim sifatida saqlandi */
  unmatched: number;
  /** Allaqachon a'zo/xodim yoki taklif yuborilgan: o'tkazib yuborildi */
  duplicates: number;
};

const rowsSchema = z
  .array(z.object({ name: z.string().trim().min(2).max(80), phone: z.string().refine((v) => parseContact(v)?.channel === "phone", "Telefon notoʻgʻri"), section: z.string().trim().max(60) }))
  .max(MAX_IMPORT_ROWS);

function checkRows(rows: MemberRow[]): MemberRow[] {
  const parsed = rowsSchema.safeParse(rows);
  if (!parsed.success) throw new DataError("invalid", "Import maʼlumotlari notoʻgʻri");
  return parsed.data.map((r) => ({ ...r, phone: parseContact(r.phone)!.value }));
}

/** Telefon bo`yicha platformadagi iqtidorni topadi (hisob telefoni mos kelsa) */
function talentByPhone(phone: string) {
  const user = store.users.find((u) => u.phone && digits(u.phone) === digits(phone));
  return user ? store.talents.find((t) => t.userId === user.id) : undefined;
}

/** Jamoa a`zolarini ommaviy import: mavjud iqtidorga taklif yuboriladi (ikki tomonlama a`zolik), qolganlari ro`yxatdan o`tmagan sifatida saqlanadi */
export async function importCollectiveMembers(collectiveId: string, rows: MemberRow[], actorId = DEFAULT_ACTOR): Promise<ImportSummary> {
  await simulateLatency();
  const collective = store.collectives.find((c) => c.id === collectiveId);
  if (!collective) throw new DataError("not_found", "Jamoa topilmadi");
  const data = checkRows(rows);
  const summary: ImportSummary = { matched: 0, unmatched: 0, duplicates: 0 };
  collective.unregisteredMembers ??= [];

  for (const row of data) {
    const talent = talentByPhone(row.phone);
    if (talent) {
      const already = collective.members.some((m) => m.talentId === talent.id) || store.collectiveInvites.some((i) => i.collectiveId === collectiveId && i.talentId === talent.id && i.status === "pending");
      if (already) {
        summary.duplicates++;
        continue;
      }
      store.collectiveInvites.push({ id: `collective-invite-${Date.now().toString(36)}-${store.collectiveInvites.length + 1}`, collectiveId, talentId: talent.id, section: row.section || "—", status: "pending", createdAt: new Date().toISOString() });
      summary.matched++;
      continue;
    }
    if (collective.unregisteredMembers.some((m) => digits(m.phone) === digits(row.phone))) {
      summary.duplicates++;
      continue;
    }
    collective.unregisteredMembers.push({ id: `unreg-${Date.now().toString(36)}-${collective.unregisteredMembers.length + 1}`, name: row.name, phone: row.phone, section: row.section });
    summary.unmatched++;
  }
  logAudit(actorId, "collective.import", "collective", collectiveId, `${data.length} qator: ${summary.matched} taklif, ${summary.unmatched} yangi, ${summary.duplicates} takror`);
  return summary;
}

/** Tashkilot xodimlarini ommaviy import; telefon mos kelgan iqtidorga bog`lanadi */
export async function importOrganizationStaff(orgId: string, rows: MemberRow[], actorId = DEFAULT_ACTOR): Promise<ImportSummary> {
  await simulateLatency();
  const org = store.organizations.find((o) => o.id === orgId);
  if (!org) throw new DataError("not_found", "Tashkilot topilmadi");
  const data = checkRows(rows);
  const summary: ImportSummary = { matched: 0, unmatched: 0, duplicates: 0 };
  org.staff ??= [];

  for (const row of data) {
    if (org.staff.some((s) => digits(s.phone) === digits(row.phone))) {
      summary.duplicates++;
      continue;
    }
    const talent = talentByPhone(row.phone);
    org.staff.push({ id: `staff-${Date.now().toString(36)}-${org.staff.length + 1}`, name: row.name, phone: row.phone, position: row.section, ...(talent ? { talentId: talent.id } : {}) });
    if (talent) summary.matched++;
    else summary.unmatched++;
  }
  logAudit(actorId, "organization.import", "organization", orgId, `${data.length} qator: ${summary.matched} bogʻlandi, ${summary.unmatched} yangi, ${summary.duplicates} takror`);
  return summary;
}
