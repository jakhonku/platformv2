"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { createCollection } from "@/lib/data/client";

/** Yangi to'plam: nom, tavsif va materiallar tanlovi */
export function CollectionForm({ ownerId, items }: { ownerId: string; items: { id: string; title: string }[] }) {
  const t = useTranslations("cabinetPage.portfolio");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (title.trim().length < 2) return setError(t("errors.collectionTitle"));
    try {
      await createCollection(ownerId, { title, description, itemIds: selected });
      toast.success(t("collectionCreated"));
      setTitle("");
      setDescription("");
      setSelected([]);
      setError(null);
      router.refresh();
    } catch {
      setError(t("error"));
    }
  });

  return (
    <Card className="p-4">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">{t("newCollection")}</h3>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="col-title">{t("fieldTitle")}</Label>
          <Input id="col-title" className="h-10" value={title} maxLength={80} onChange={(e) => (setTitle(e.target.value), setError(null))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="col-desc">{t("fieldDescription")}</Label>
          <Textarea id="col-desc" rows={2} value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {items.length > 0 && (
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 text-sm font-medium">{t("pickItems")}</legend>
            <div className="grid max-h-40 gap-1 overflow-y-auto rounded-lg border p-2 sm:grid-cols-2">
              {items.map((m) => (
                <label key={m.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted">
                  <input type="checkbox" checked={selected.includes(m.id)} onChange={(e) => setSelected((s) => (e.target.checked ? [...s, m.id] : s.filter((x) => x !== m.id)))} className="size-4 shrink-0 accent-primary" />
                  <span className="truncate">{m.title}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <div aria-live="polite">{error && <p className="text-sm text-destructive">{error}</p>}</div>
        <Button type="submit" className="w-fit">
          {t("createCollection")}
        </Button>
      </form>
    </Card>
  );
}
