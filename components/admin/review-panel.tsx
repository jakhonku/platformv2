"use client";

import { useState } from "react";
import { Check, Clock, Phone, X } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@/i18n/navigation";
import { logReviewCall, moderate, setReviewChecklist, startReview } from "@/lib/data/client";
import type { ModerationItem } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { approvalBlockers, type Blocker } from "@/lib/review";
import { talent as talentRoute } from "@/lib/routes";
import type { Collective, Organization } from "@/types/collective";
import type { LocaleCode } from "@/types/common";
import type { MediaItem } from "@/types/media";
import type { ReviewCall, ReviewKind } from "@/types/review";
import type { TalentProfile } from "@/types/talent";
import { MediaPreview } from "./media-preview";

const MIN_REASON = 5;
const OUTCOMES: ReviewCall["outcome"][] = ["reached", "no_answer", "wrong_number", "callback"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-t pt-4 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm">{value || "—"}</dd>
    </div>
  );
}

/** Ariza tafsilotlari: to`liqlik, hujjatlar, telefon orqali aniqlash, qo`ng`iroqlar jurnali va qaror */
export function ReviewPanel({ item, actorId, actors }: { item: ModerationItem; actorId: string; actors: Record<string, string> }) {
  const t = useTranslations("adminPage.review");
  const tm = useTranslations("adminPage.moderation");
  const tr = useTranslations("adminPage.moderation.meta");
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<ReviewCall["outcome"]>("reached");
  const [note, setNote] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const isApplication = item.kind !== "media";
  const kind = item.kind as ReviewKind;
  const review = item.review;
  const payload = item.payload as TalentProfile | Organization | Collective;
  const blockers: Blocker[] = isApplication && review ? approvalBlockers(kind, payload, review) : [];
  const decided = item.status !== "pending";
  const assignee = review?.assigneeId ? (actors[review.assigneeId] ?? review.assigneeId) : null;
  const who = (id: string) => actors[id] ?? id;

  async function run(action: () => Promise<unknown>, success?: string) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      if (success) toast.success(success);
      router.refresh();
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  }

  const documents = item.meta?.documents ?? [];

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {isApplication && item.completeness && (
        <Section title={t("completeness")}>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={item.completeness.percent} aria-valuemin={0} aria-valuemax={100} aria-label={t("completeness")}>
              <div className={`h-full rounded-full ${item.completeness.percent === 100 ? "bg-green-500" : "bg-amber-500"}`} style={{ width: `${item.completeness.percent}%` }} />
            </div>
            <span className="text-sm font-medium tabular-nums">{item.completeness.percent}%</span>
          </div>
          {item.completeness.missing.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {item.completeness.missing.map((m) => (
                <li key={m}>
                  <StatusBadge tone="red">{t(`missing.${m}`)}</StatusBadge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-green-700">{t("complete")}</p>
          )}
        </Section>
      )}

      <Section title={t("details")}>
        {item.kind === "media" ? (
          <MediaPreview item={payload as unknown as MediaItem} />
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            {item.meta?.owner && <Fact label={tr("owner")} value={item.meta.owner} />}
            {item.meta?.identity && <Fact label={tr("identity")} value={`${tr(item.meta.identity)}${item.meta.identityType ? ` · ${tr(item.meta.identityType)}` : ""}`} />}
            {item.meta?.stir && <Fact label={tr("stir")} value={item.meta.stir} />}
            {"city" in payload && <Fact label={t("city")} value={payload.city} />}
            {item.kind === "profile" && <Fact label={t("experience")} value={(payload as TalentProfile).experienceYears} />}
            {item.counts?.members !== undefined && <Fact label={t("members")} value={`${item.counts.members} (+${item.counts.unregistered ?? 0} ${t("unregistered")})`} />}
            {item.counts?.staff !== undefined && <Fact label={t("staff")} value={item.counts.staff} />}
            <div className="sm:col-span-2">
              <Fact label={item.kind === "profile" ? t("bio") : t("description")} value={item.kind === "profile" ? (payload as TalentProfile).bio : (payload as Organization | Collective).description} />
            </div>
            {item.kind === "profile" && (
              <Link href={talentRoute((payload as TalentProfile).kind, (payload as TalentProfile).slug)} className="w-fit text-xs font-medium text-primary hover:underline">
                {tm("openProfile")}
              </Link>
            )}
          </dl>
        )}
      </Section>

      {isApplication && (
        <>
          {item.kind !== "profile" && (
            <Section title={tr("documents")}>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">{tr("noDocuments")}</p>
              ) : (
                <ul className="flex flex-col gap-1 text-sm">
                  {documents.map((d) => (
                    <li key={d} className="break-all">
                      {d}
                    </li>
                  ))}
                </ul>
              )}
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={review?.checklist.documents ?? false}
                  disabled={busy || decided}
                  onChange={(e) => run(() => setReviewChecklist(kind, item.id, { documents: e.target.checked }, actorId))}
                />
                {t("documentsReviewed")}
              </label>
            </Section>
          )}

          <Section title={t("phoneTitle")}>
            {item.phone ? (
              <a href={`tel:${item.phone.replace(/[^\d+]/g, "")}`} className="inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted">
                <Phone className="size-4" aria-hidden />
                {item.phone}
              </a>
            ) : (
              <p className="text-sm text-destructive">{t("noPhone")}</p>
            )}
            <p className="flex items-center gap-1.5 text-xs">
              {review?.checklist.phone ? <Check className="size-4 text-green-600" aria-hidden /> : <Clock className="size-4 text-muted-foreground" aria-hidden />}
              {t(review?.checklist.phone ? "phoneVerified" : "phonePending")}
            </p>
            {review && review.calls.length > 0 && (
              <ol className="flex flex-col gap-2" aria-label={t("callLog")}>
                {review.calls.map((c) => (
                  <li key={c.id} className="rounded-lg bg-muted/60 p-2 text-xs">
                    <p className="text-muted-foreground">
                      {formatDate(c.at, locale)} {c.at.slice(11, 16)} · {who(c.byId)} · <span className="font-medium text-foreground">{t(`outcome.${c.outcome}`)}</span>
                    </p>
                    <p className="break-words">{c.note}</p>
                  </li>
                ))}
              </ol>
            )}
            {!decided && (
              <div className="flex flex-col gap-2 rounded-lg border p-3">
                <Label htmlFor="call-outcome">{t("logCall")}</Label>
                <NativeSelect id="call-outcome" value={outcome} onChange={(e) => setOutcome(e.target.value as ReviewCall["outcome"])}>
                  {OUTCOMES.map((o) => (
                    <option key={o} value={o}>
                      {t(`outcome.${o}`)}
                    </option>
                  ))}
                </NativeSelect>
                <Textarea aria-label={t("callNote")} placeholder={t("callNote")} rows={3} value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
                <Button size="sm" className="w-fit" disabled={busy || note.trim().length < 3} onClick={() => run(async () => { await logReviewCall(kind, item.id, { outcome, note }, actorId); setNote(""); }, t("callLogged"))}>
                  {t("saveCall")}
                </Button>
              </div>
            )}
          </Section>

          <Section title={t("responsible")}>
            <p className="text-sm">{assignee ? t("assignedTo", { name: assignee }) : t("unassigned")}</p>
            {!decided && (
              <Button size="sm" variant="outline" className="w-fit" disabled={busy || review?.assigneeId === actorId} onClick={() => run(() => startReview(kind, item.id, actorId), t("started"))}>
                {assignee && review?.assigneeId !== actorId ? t("takeOver") : t("start")}
              </Button>
            )}
          </Section>
        </>
      )}

      <Section title={t("decision")}>
        {decided ? (
          <div className="flex flex-col gap-1 text-sm">
            <StatusBadge tone={item.status === "approved" ? "green" : "red"}>{tm(item.status === "approved" ? "approvedToast" : "rejectedToast")}</StatusBadge>
            {"moderationNote" in payload && payload.moderationNote && <p className="break-words text-muted-foreground">{t("reasonLine", { reason: payload.moderationNote })}</p>}
          </div>
        ) : (
          <>
            {blockers.length > 0 && (
              <ul className="flex flex-col gap-1 rounded-lg bg-amber-50 p-3 text-xs text-amber-800" aria-label={t("blockersTitle")}>
                {blockers.map((b) => (
                  <li key={b}>• {t(`blockers.${b}`)}</li>
                ))}
              </ul>
            )}
            {rejecting ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="reject-reason">{tm("reason")}</Label>
                <Textarea id="reject-reason" rows={3} value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} />
                <p className="text-xs text-muted-foreground">{tm("reasonHint", { min: MIN_REASON })}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" disabled={busy || reason.trim().length < MIN_REASON} onClick={() => run(() => moderate(item.kind, item.id, "rejected", reason.trim(), actorId), tm("rejectedToast"))}>
                    {tm("reject")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRejecting(false)}>
                    {tm("cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={busy || blockers.length > 0} onClick={() => run(() => moderate(item.kind, item.id, "approved", undefined, actorId), tm("approvedToast"))}>
                  <Check aria-hidden />
                  {tm("approve")}
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => setRejecting(true)}>
                  <X aria-hidden />
                  {tm("reject")}
                </Button>
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  );
}
