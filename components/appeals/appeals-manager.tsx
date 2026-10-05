"use client";

import { useState } from "react";
import { Plus } from "@/components/icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@/i18n/navigation";
import type { PdfUpload } from "@/lib/appeal-files";
import { createAppeal } from "@/lib/data/client";
import type { Role } from "@/lib/demo/role";
import type { Appeal, AppealKind } from "@/types/appeal";
import { AppealKindBadge, AppealStatusBadge } from "./appeal-badges";
import { formatDateTime } from "./appeal-thread";
import { PdfPicker } from "./pdf-picker";

/** Rolga mos xat turlari: e'lon so'rovi tashkilotga, tadbir so'rovi jamoaga */
function kindsFor(role: Role): AppealKind[] {
  const base: AppealKind[] = ["suggestion", "appeal"];
  if (role === "organization") return [...base, "opening_request"];
  if (role === "collective") return [...base, "event_request"];
  return base;
}

export function AppealsManager({ userId, role, appeals, startKind }: { userId: string; role: Role; appeals: Appeal[]; startKind?: AppealKind | null }) {
  const t = useTranslations("appeals.user");
  const tk = useTranslations("appeals.kind");
  const router = useRouter();
  const kinds = kindsFor(role);
  const initialKind = startKind && kinds.includes(startKind) ? startKind : kinds[0];
  const [open, setOpen] = useState(!!startKind);
  const [kind, setKind] = useState<AppealKind>(initialKind);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<PdfUpload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (subject.trim().length < 5) return setError(t("errors.subject"));
    if (message.trim().length < 10 && files.length === 0) return setError(t("errors.content"));
    setPending(true);
    try {
      const letter = await createAppeal(userId, { kind, subject, message, files });
      toast.success(t("sent", { number: letter.number, position: letter.queuePosition ?? 1 }));
      setOpen(false);
      setSubject("");
      setMessage("");
      setFiles([]);
      setError(null);
      router.replace("/cabinet/appeals");
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    } finally {
      setPending(false);
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button onClick={() => setOpen(true)} className="h-10 rounded-full px-5">
          <Plus aria-hidden /> {t("new")}
        </Button>
      </div>

      {appeals.length === 0 ? (
        <EmptyState title={t("emptyTitle")} text={t("emptyText")} />
      ) : (
        <ul className="flex flex-col gap-3">
          {appeals.map((a) => (
            <li key={a.id}>
              <Link href={`/cabinet/appeals/${a.id}`} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
                <Card className="gap-2 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-4">
                  <span className="font-mono text-sm font-semibold tracking-wide sm:w-40 sm:shrink-0">{a.number}</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-sm font-semibold break-words">{a.subject}</span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{formatDateTime(a.createdAt)}</span>
                      <AppealKindBadge kind={a.kind} />
                    </span>
                  </span>
                  <span className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {a.status === "new" && a.queuePosition && <StatusBadge tone="gray">{t("queueBadge", { n: a.queuePosition })}</StatusBadge>}
                    <AppealStatusBadge status={a.status} />
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("new")}</DialogTitle>
            <DialogDescription>{t("formText")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appeal-kind">{t("kind")}</Label>
              <NativeSelect id="appeal-kind" value={kind} onChange={(e) => setKind(e.target.value as AppealKind)}>
                {kinds.map((k) => (
                  <option key={k} value={k}>
                    {tk(k)}
                  </option>
                ))}
              </NativeSelect>
              {(kind === "opening_request" || kind === "event_request") && <p className="text-xs text-muted-foreground">{t("adminOnlyHint")}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appeal-subject">{t("subject")}</Label>
              <Input id="appeal-subject" className="h-10" value={subject} maxLength={150} onChange={(e) => (setSubject(e.target.value), setError(null))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appeal-message">{t("message")}</Label>
              <Textarea id="appeal-message" rows={6} value={message} maxLength={3000} onChange={(e) => (setMessage(e.target.value), setError(null))} />
              <p className="text-xs text-muted-foreground">{t("messageHint")}</p>
            </div>
            <PdfPicker files={files} onChange={(f) => (setFiles(f), setError(null))} disabled={pending} />
            <div aria-live="polite">{error && <p className="text-sm text-destructive">{error}</p>}</div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? t("sending") : t("submit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
