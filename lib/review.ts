import type { Collective, Organization } from "../types/collective.ts";
import type { ReviewKind, ReviewState } from "../types/review.ts";
import type { TalentProfile } from "../types/talent.ts";

export type MissingField = "specialty" | "bio" | "city" | "region" | "skills" | "contact" | "description" | "phone" | "stir" | "documents";
export type Blocker = "not_started" | "data" | "documents" | "phone";

type Payload = TalentProfile | Organization | Collective;
type Check = [MissingField, boolean];

/** Har bir tur uchun tekshiruvlar (true — to`ldirilgan) */
function checks(kind: ReviewKind, p: Payload): Check[] {
  if (kind === "profile") {
    const t = p as TalentProfile;
    const list: Check[] = [
      ["specialty", t.specialty.trim().length >= 2],
      ["bio", t.bio.trim().length >= 10],
      ["city", t.city.trim().length > 0],
      ["region", t.regionId.trim().length > 0],
      ["contact", Boolean(t.contacts.phone || t.contacts.email)],
    ];
    if (t.kind === "musician") list.push(["skills", t.instrumentIds.length > 0]);
    if (t.kind === "vocalist") list.push(["skills", Boolean(t.voiceTypeId)]);
    return list;
  }
  if (kind === "organization") {
    const o = p as Organization;
    return [
      ["description", o.description.trim().length >= 10],
      ["city", o.city.trim().length > 0],
      ["phone", Boolean(o.contacts.phone)],
      ["stir", /^\d{9}$/.test(o.stir ?? "")],
      ["documents", (o.documents ?? []).length > 0],
    ];
  }
  const c = p as Collective;
  return [
    ["description", c.description.trim().length >= 10],
    ["city", c.city.trim().length > 0],
    ["phone", Boolean(c.contacts.phone)],
    ["documents", (c.documents ?? []).length > 0],
  ];
}

export const missingFields = (kind: ReviewKind, payload: Payload): MissingField[] => checks(kind, payload).filter(([, ok]) => !ok).map(([field]) => field);

export function completeness(kind: ReviewKind, payload: Payload): { missing: MissingField[]; percent: number } {
  const list = checks(kind, payload);
  const missing = list.filter(([, ok]) => !ok).map(([field]) => field);
  return { missing, percent: Math.round(((list.length - missing.length) / list.length) * 100) };
}

/** Tasdiqlashga to`sqinlik qiluvchi shartlar (bo`sh ro`yxat — tasdiqlash mumkin) */
export function approvalBlockers(kind: ReviewKind, payload: Payload, review: ReviewState): Blocker[] {
  const out: Blocker[] = [];
  if (!review.assigneeId) out.push("not_started");
  if (missingFields(kind, payload).length > 0) out.push("data");
  if (kind !== "profile" && !review.checklist.documents) out.push("documents");
  if (!review.checklist.phone) out.push("phone");
  return out;
}

export type ReviewTab = "new" | "in_review" | "approved" | "rejected";

/** Jadval tabi: kutilayotgan ariza mas`ul tayinlanmaguncha "Yangi", keyin "Tekshiruvda" */
export function reviewTab(status: "pending" | "approved" | "rejected", review?: ReviewState): ReviewTab {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  return review?.assigneeId ? "in_review" : "new";
}
