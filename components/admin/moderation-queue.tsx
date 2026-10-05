"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@/i18n/navigation";
import { moderate } from "@/lib/data/client";
import type { ModerationItem, ModerationKind } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { talent as talentRoute } from "@/lib/routes";
import type { Organization } from "@/types/collective";
import type { LocaleCode } from "@/types/common";
import type { MediaItem } from "@/types/media";
import type { TalentProfile } from "@/types/talent";
import { MediaPreview } from "./media-preview";

const MIN_REASON = 5;

function Payload({ item }: { item: ModerationItem }) {
  const t = useTranslations("adminPage.moderation");
  if (item.kind === "media") return <MediaPreview item={item.payload as MediaItem} />;
  if (item.kind === "profile") {
    const p = item.payload as TalentProfile;
    return (
      <div className="flex flex-col gap-1 text-sm">
        <p className="text-muted-foreground">
          {p.city} · {t("experience", { count: p.experienceYears })}
        </p>
        <p className="line-clamp-4 break-words">{p.bio}</p>
        <Link href={talentRoute(p.kind, p.slug)} className="w-fit text-xs font-medium text-primary hover:underline">
          {t("openProfile")}
        </Link>
      </div>
    );
  }
  const o = item.payload as Organization;
  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="text-muted-foreground">{o.city}</p>
      <p className="line-clamp-4 break-words">{o.description}</p>
      <p className="break-all text-xs text-muted-foreground">{[o.contacts.email, o.contacts.phone].filter(Boolean).join(" · ")}</p>
    </div>
  );
}

/** Moderatsiya navbati: tasdiqlash yoki sabab bilan rad etish */
export function ModerationQueue({ kind, items, actorId }: { kind: ModerationKind; items: ModerationItem[]; actorId: string }) {
  const t = useTranslations("adminPage.moderation");
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [rejecting, setRejecting] = useState<ModerationItem | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const reasonOk = reason.trim().length >= MIN_REASON;

  async function decide(item: ModerationItem, decision: "approved" | "rejected", why?: string) {
    if (busy) return;
    setBusy(true);
    try {
      await moderate(kind, item.id, decision, why, actorId);
      toast.success(t(decision === "approved" ? "approvedToast" : "rejectedToast"));
      setRejecting(null);
      setReason("");
      router.refresh();
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0) return <EmptyState title={t("emptyTitle")} text={t("emptyText")} />;

  return (
    <>
      <ul className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <Card className="h-full gap-3 p-4">
              <div className="min-w-0">
                <h2 className="break-words text-sm font-semibold">{item.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {item.subtitle} · {formatDate(item.submittedAt, locale)}
                </p>
              </div>
              <Payload item={item} />
              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                <Button size="sm" disabled={busy} onClick={() => decide(item, "approved")}>
                  <Check aria-hidden />
                  {t("approve")}
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => (setReason(""), setRejecting(item))}>
                  <X aria-hidden />
                  {t("reject")}
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectTitle")}</DialogTitle>
            <DialogDescription>{rejecting?.title}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reject-reason">{t("reason")}</Label>
            <Textarea id="reject-reason" rows={4} value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} aria-describedby="reject-hint" />
            <p id="reject-hint" className="text-xs text-muted-foreground">
              {t("reasonHint", { min: MIN_REASON })}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" disabled={busy || !reasonOk} onClick={() => rejecting && decide(rejecting, "rejected", reason.trim())}>
              {t("reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
