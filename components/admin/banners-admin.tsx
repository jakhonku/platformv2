"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "@/components/icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { useRouter } from "@/i18n/navigation";
import { deleteBanner, saveBanner } from "@/lib/data/client";
import type { Banner } from "@/types/admin";
import { ConfirmDialog } from "./confirm-dialog";
import { CoverSelect } from "./cover-select";

function BannerForm({ initial, actorId, onClose }: { initial: Banner | null; actorId: string; onClose: () => void }) {
  const t = useTranslations("adminPage.banners");
  const router = useRouter();
  const [v, setV] = useState({ title: initial?.title ?? "", link: initial?.link ?? "/", imageUrl: initial?.imageUrl ?? "", active: initial?.active ?? true });
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) => (setV((s) => ({ ...s, [key]: value })), setError(null));

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (v.title.trim().length < 2) return setError(t("errors.title"));
    if (!(v.link.startsWith("/") || v.link.startsWith("https://"))) return setError(t("errors.link"));
    try {
      await saveBanner({ id: initial?.id, ...v }, actorId);
      toast.success(t("saved"));
      onClose();
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? t("editTitle") : t("createTitle")}</DialogTitle>
          <DialogDescription>{t("formText")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-title">{t("fieldTitle")}</Label>
            <Input id="b-title" className="h-10" value={v.title} maxLength={100} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-link">{t("link")}</Label>
            <Input id="b-link" className="h-10" value={v.link} onChange={(e) => set("link", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-image">{t("image")}</Label>
            <CoverSelect id="b-image" optional value={v.imageUrl} onChange={(x) => set("imageUrl", x)} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={v.active} onChange={(e) => set("active", e.target.checked)} className="size-4 accent-primary" />
            {t("active")}
          </label>
          <div aria-live="polite">{error && <p className="text-sm text-destructive">{error}</p>}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function BannersAdmin({ banners, actorId }: { banners: Banner[]; actorId: string }) {
  const t = useTranslations("adminPage.banners");
  const router = useRouter();
  const [form, setForm] = useState<{ initial: Banner | null; key: number } | null>(null);
  const [deleting, setDeleting] = useState<Banner | null>(null);
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      await deleteBanner(deleting.id, actorId);
      toast.success(t("deleted"));
      setDeleting(null);
      router.refresh();
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button onClick={() => setForm({ initial: null, key: Date.now() })}>
          <Plus aria-hidden />
          {t("add")}
        </Button>
      </div>
      {banners.length === 0 ? (
        <EmptyState title={t("empty")} />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {banners.map((b) => (
            <li key={b.id}>
              <Card className="h-full gap-2 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 break-words text-sm font-semibold">{b.title}</p>
                  <StatusBadge tone={b.active ? "green" : "gray"}>{t(b.active ? "on" : "off")}</StatusBadge>
                </div>
                <p className="break-all text-xs text-muted-foreground">{b.link}</p>
                <div className="mt-auto flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setForm({ initial: b, key: Date.now() })}>
                    <Pencil aria-hidden />
                    {t("edit")}
                  </Button>
                  <Button size="sm" variant="ghost" aria-label={t("delete")} onClick={() => setDeleting(b)}>
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      {form && <BannerForm key={form.key} initial={form.initial} actorId={actorId} onClose={() => setForm(null)} />}
      <ConfirmDialog open={!!deleting} title={t("deleteTitle")} text={t("deleteText", { title: deleting?.title ?? "" })} busy={busy} onClose={() => setDeleting(null)} onConfirm={remove} />
    </div>
  );
}
