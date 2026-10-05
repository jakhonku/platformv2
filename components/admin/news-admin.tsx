"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteNews, saveNews } from "@/lib/data/client";
import { formatDate } from "@/lib/format";
import { news as newsRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import type { NewsItem } from "@/types/content";
import { ConfirmDialog } from "./confirm-dialog";
import { CoverSelect } from "./cover-select";
import { DataTable } from "./data-table";

type Option = { value: string; label: string };

function NewsForm({ initial, categories, actorId, onClose }: { initial: NewsItem | null; categories: Option[]; actorId: string; onClose: () => void }) {
  const t = useTranslations("adminPage.news");
  const router = useRouter();
  const [v, setV] = useState({ title: initial?.title ?? "", excerpt: initial?.excerpt ?? "", body: initial?.body ?? "", categoryId: initial?.categoryId ?? categories[0]?.value ?? "", imageUrl: initial?.imageUrl ?? "/placeholders/cover-1.svg" });
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) => (setV((s) => ({ ...s, [key]: value })), setError(null));

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (v.title.trim().length < 5 || v.excerpt.trim().length < 10 || v.body.trim().length < 20) return setError(t("errors.fields"));
    try {
      await saveNews({ id: initial?.id, ...v }, actorId);
      toast.success(t("saved"));
      onClose();
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    }
  });

  const field = (id: string, label: string, control: React.ReactNode) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {control}
    </div>
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? t("editTitle") : t("createTitle")}</DialogTitle>
          <DialogDescription>{t("formText")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          {field("n-title", t("fieldTitle"), <Input id="n-title" className="h-10" value={v.title} maxLength={150} onChange={(e) => set("title", e.target.value)} />)}
          {field("n-excerpt", t("excerpt"), <Textarea id="n-excerpt" rows={2} value={v.excerpt} maxLength={400} onChange={(e) => set("excerpt", e.target.value)} />)}
          {field("n-body", t("body"), <Textarea id="n-body" rows={6} value={v.body} maxLength={10000} onChange={(e) => set("body", e.target.value)} />)}
          {field("n-category", t("category"), <NativeSelect id="n-category" value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)}>{categories.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>)}
          {field("n-image", t("image"), <CoverSelect id="n-image" value={v.imageUrl} onChange={(x) => set("imageUrl", x)} />)}
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

export function NewsAdmin({ items, categories, actorId }: { items: NewsItem[]; categories: Option[]; actorId: string }) {
  const t = useTranslations("adminPage.news");
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [form, setForm] = useState<{ initial: NewsItem | null; key: number } | null>(null);
  const [deleting, setDeleting] = useState<NewsItem | null>(null);
  const [busy, setBusy] = useState(false);
  const catName = (id: string) => categories.find((c) => c.value === id)?.label ?? id;

  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      await deleteNews(deleting.id, actorId);
      toast.success(t("deleted"));
      setDeleting(null);
      router.refresh();
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setBusy(false);
    }
  }

  const actions = (n: NewsItem) => (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={() => setForm({ initial: n, key: Date.now() })}>
        <Pencil aria-hidden />
        {t("edit")}
      </Button>
      <Button size="sm" variant="ghost" aria-label={t("delete")} onClick={() => setDeleting(n)}>
        <Trash2 aria-hidden />
      </Button>
    </div>
  );

  const columns: LegacyColumnDef<NewsItem>[] = [
    { accessorKey: "title", header: t("fieldTitle"), cell: ({ row }) => <Link href={newsRoute(row.original.slug)} className="font-medium hover:underline">{row.original.title}</Link> },
    { accessorKey: "categoryId", header: t("category"), cell: ({ row }) => catName(row.original.categoryId) },
    { accessorKey: "publishedAt", header: t("published"), cell: ({ row }) => formatDate(row.original.publishedAt, locale) },
    { id: "actions", header: "", enableSorting: false, cell: ({ row }) => actions(row.original) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button onClick={() => setForm({ initial: null, key: Date.now() })}>
          <Plus aria-hidden />
          {t("add")}
        </Button>
      </div>
      <DataTable
        data={items}
        columns={columns}
        getRowId={(n) => n.id}
        searchText={(n) => `${n.title} ${n.excerpt}`}
        emptyTitle={t("empty")}
        mobileCard={(n) => (
          <Card className="gap-2 p-4">
            <Link href={newsRoute(n.slug)} className="break-words text-sm font-semibold hover:underline">{n.title}</Link>
            <p className="text-xs text-muted-foreground">{catName(n.categoryId)} · {formatDate(n.publishedAt, locale)}</p>
            {actions(n)}
          </Card>
        )}
      />
      {form && <NewsForm key={form.key} initial={form.initial} categories={categories} actorId={actorId} onClose={() => setForm(null)} />}
      <ConfirmDialog open={!!deleting} title={t("deleteTitle")} text={t("deleteText", { title: deleting?.title ?? "" })} busy={busy} onClose={() => setDeleting(null)} onConfirm={remove} />
    </div>
  );
}
