"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Send } from "@/components/icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import type { PdfUpload } from "@/lib/appeal-files";
import { markAppealOpened, replyToAppeal, returnAppeal, setAppealStatus } from "@/lib/data/client";
import type { Appeal } from "@/types/appeal";
import { PdfPicker } from "./pdf-picker";

/** Admin: xatni ochadi (navbatdan chiqadi), javob beradi, qaytaradi, yopadi yoki qayta ochadi */
export function LetterActionsAdmin({ appeal, actorId }: { appeal: Appeal; actorId: string }) {
  const t = useTranslations("appeals.admin");
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [files, setFiles] = useState<PdfUpload[]>([]);
  const [reason, setReason] = useState("");
  const [returning, setReturning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const opened = useRef(false);

  // Xat ochilganda "navbatda" holatidan "ko'rib chiqilmoqda"ga o'tadi
  useEffect(() => {
    if (appeal.status !== "new" || opened.current) return;
    opened.current = true;
    void markAppealOpened(appeal.id, actorId)
      .then(() => router.refresh())
      .catch(() => undefined);
  }, [appeal.id, appeal.status, actorId, router]);

  async function run(action: () => Promise<unknown>, success: string) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      toast.success(success);
      setReply("");
      setFiles([]);
      setReason("");
      setReturning(false);
      setError(null);
      router.refresh();
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  }

  function send(close: boolean) {
    if (reply.trim().length < 10 && files.length === 0) return setError(t("errors.reply"));
    void run(() => replyToAppeal(appeal.id, actorId, { text: reply, files }, close), close ? t("sentClosed") : t("sent"));
  }

  function doReturn() {
    if (reason.trim().length < 10) return setError(t("errors.reason"));
    void run(() => returnAppeal(appeal.id, actorId, reason), t("returned"));
  }

  if (appeal.status === "closed") {
    return (
      <Card className="gap-3 p-5 print:hidden">
        <Button type="button" variant="outline" className="w-fit" disabled={busy} onClick={() => run(() => setAppealStatus(appeal.id, "in_review", actorId), t("reopened"))}>
          {t("reopen")}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="gap-4 p-5 print:hidden">
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-reply">{t("replyLabel")}</Label>
        <Textarea id="admin-reply" rows={5} value={reply} maxLength={3000} onChange={(e) => (setReply(e.target.value), setError(null))} />
        <PdfPicker files={files} onChange={(f) => (setFiles(f), setError(null))} disabled={busy} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy} onClick={() => send(false)}>
          <Send aria-hidden /> {t("send")}
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => send(true)}>
          <Check aria-hidden /> {t("sendClose")}
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => (setReturning((v) => !v), setError(null))} aria-expanded={returning}>
          {t("return")}
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => run(() => setAppealStatus(appeal.id, "closed", actorId), t("closed"))}>
          {t("close")}
        </Button>
      </div>
      {returning && (
        <div className="flex flex-col gap-2 rounded-xl border p-3">
          <Label htmlFor="admin-return">{t("returnReason")}</Label>
          <p className="text-xs text-muted-foreground">{t("returnHint")}</p>
          <Textarea id="admin-return" rows={3} value={reason} maxLength={500} onChange={(e) => (setReason(e.target.value), setError(null))} />
          <Button type="button" variant="destructive" className="w-fit" disabled={busy} onClick={doReturn}>
            {t("returnConfirm")}
          </Button>
        </div>
      )}
    </Card>
  );
}
