import { z } from "zod";
import type { ReviewCall, ReviewKind, ReviewState } from "../../types/review.ts";
import { logAudit } from "./audit.ts";
import { DataError } from "./errors.ts";
import { simulateLatency } from "./latency.ts";
import { store } from "./store.ts";
import { clone } from "./text.ts";

const DEFAULT_ACTOR = "user-moderator";
const KINDS: ReviewKind[] = ["profile", "organization", "collective"];

const keyOf = (kind: ReviewKind, id: string) => `${kind}:${id}`;
const emptyReview = (): ReviewState => ({ checklist: { documents: false, phone: false }, calls: [] });

export const getReviewState = (kind: ReviewKind, id: string): ReviewState => store.reviews[keyOf(kind, id)] ?? emptyReview();

function exists(kind: ReviewKind, id: string): boolean {
  if (kind === "profile") return store.talents.some((t) => t.id === id);
  if (kind === "organization") return store.organizations.some((o) => o.id === id);
  return store.collectives.some((c) => c.id === id);
}

/** Yozuv mavjudligini tekshirib, ko`rib chiqish holatini yaratadi/qaytaradi */
function ensure(kind: ReviewKind, id: string): ReviewState {
  if (!KINDS.includes(kind)) throw new DataError("invalid", "Bu tur uchun tekshiruv yoʻq");
  if (!exists(kind, id)) throw new DataError("not_found", "Ariza topilmadi");
  const key = keyOf(kind, id);
  return (store.reviews[key] ??= emptyReview());
}

/** Mas`ul admin arizani o`z nazoratiga oladi (boshqa mas`ul bo`lsa ham qayta tayinlanadi, jurnalga yoziladi) */
export async function startReview(kind: ReviewKind, id: string, actorId = DEFAULT_ACTOR): Promise<ReviewState> {
  await simulateLatency();
  const review = ensure(kind, id);
  const previous = review.assigneeId;
  review.assigneeId = actorId;
  review.assignedAt = new Date().toISOString();
  logAudit(actorId, previous && previous !== actorId ? `${kind}.reassign` : `${kind}.review_start`, kind === "profile" ? "talent" : kind, id, previous && previous !== actorId ? `oldingi masʼul: ${previous}` : undefined);
  return clone(review);
}

/** Telefon belgisi faqat «javob berdi» qo`ng`irog`i bo`lgandan keyin qo`yiladi */
export async function setReviewChecklist(kind: ReviewKind, id: string, patch: Partial<ReviewState["checklist"]>, actorId = DEFAULT_ACTOR): Promise<ReviewState> {
  await simulateLatency();
  const review = ensure(kind, id);
  if (patch.phone === true && !review.calls.some((c) => c.outcome === "reached")) throw new DataError("forbidden", "Avval telefon orqali bogʻlanilganini qayd eting");
  if (typeof patch.documents === "boolean") review.checklist.documents = patch.documents;
  if (typeof patch.phone === "boolean") review.checklist.phone = patch.phone;
  if (!review.assigneeId) {
    review.assigneeId = actorId;
    review.assignedAt = new Date().toISOString();
  }
  logAudit(actorId, `${kind}.checklist`, kind === "profile" ? "talent" : kind, id, JSON.stringify(review.checklist));
  return clone(review);
}

const callSchema = z.object({ outcome: z.enum(["reached", "no_answer", "wrong_number", "callback"]), note: z.string().trim().min(3).max(500) });

/** Qo`ng`iroqni jurnalga yozadi; «javob berdi» bo`lsa telefon belgisi avtomatik qo`yiladi */
export async function logReviewCall(kind: ReviewKind, id: string, p: { outcome: ReviewCall["outcome"]; note: string }, actorId = DEFAULT_ACTOR): Promise<ReviewState> {
  await simulateLatency();
  const parsed = callSchema.safeParse(p);
  if (!parsed.success) throw new DataError("invalid", "Qoʻngʻiroq maʼlumotlari notoʻgʻri");
  const review = ensure(kind, id);
  review.calls.push({ id: `call-${Date.now().toString(36)}-${review.calls.length + 1}`, at: new Date().toISOString(), byId: actorId, ...parsed.data });
  if (parsed.data.outcome === "reached") review.checklist.phone = true;
  if (!review.assigneeId) {
    review.assigneeId = actorId;
    review.assignedAt = new Date().toISOString();
  }
  logAudit(actorId, `${kind}.call`, kind === "profile" ? "talent" : kind, id, `${parsed.data.outcome}: ${parsed.data.note}`);
  return clone(review);
}
