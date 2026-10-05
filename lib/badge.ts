import type { TalentProfile } from "../types/talent.ts";

/** Raqamli nishon: tasdiqlangan va moderatsiyadan o'tgan iqtidorga beriladi */
export const hasBadge = (t: Pick<TalentProfile, "verified" | "moderation">): boolean => t.verified && t.moderation === "approved";

/** Barqaror, o'qiladigan nishon raqami: TLNT-XXXXXX (id'dan hosil qilinadi) */
export function badgeCode(id: string): string {
  let h = 2166136261;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return `TLNT-${h.toString(36).toUpperCase().padStart(6, "0").slice(-6)}`;
}
