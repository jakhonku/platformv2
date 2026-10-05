"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { saveCompetition, saveFestival } from "@/lib/data/client";
import type { Competition, Festival } from "@/types/content";
import { CoverSelect } from "./cover-select";

type Option = { value: string; label: string };
type Initial = Competition | Festival | null;

const day = (iso: string | undefined) => (iso ? iso.slice(0, 10) : "");
const at = (d: string) => `${d}T10:00:00.000Z`;

function initialState(kind: "competition" | "festival", initial: Initial, regions: Option[], categories: Option[]) {
  const c = initial as Competition | null;
  const f = initial as Festival | null;
  return {
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    regionId: initial?.regionId ?? regions[0]?.value ?? "",
    city: initial?.city ?? "",
    startDate: day(initial?.startDate),
    endDate: day(initial?.endDate),
    imageUrl: initial?.imageUrl ?? "/placeholders/cover-1.svg",
    deadline: day(c?.deadline),
    categoryId: c?.categoryId ?? categories[0]?.value ?? "",
    prize: c?.prizeFundUzs !== undefined ? String(c.prizeFundUzs) : "",
    lineup: kind === "festival" ? (f?.lineup ?? []).join("\n") : "",
  };
}

/** Tanlov yoki festival qo`shish/tahrirlash dialogi */
export function EventForm({ kind, initial, open, onOpenChange, regions, categories, actorId }: { kind: "competition" | "festival"; initial: Initial; open: boolean; onOpenChange: (o: boolean) => void; regions: Option[]; categories: Option[]; actorId: string }) {
  const t = useTranslations("adminPage.events");
  const router = useRouter();
  const [v, setV] = useState(() => initialState(kind, initial, regions, categories));
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) => (setV((s) => ({ ...s, [key]: value })), setError(null));

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (v.title.trim().length < 3 || v.description.trim().length < 10 || !v.city.trim()) return setError(t("errors.fields"));
    if (!v.startDate || !v.endDate || v.startDate > v.endDate) return setError(t("errors.dates"));
    if (kind === "competition" && !v.deadline) return setError(t("errors.deadline"));
    const base = { id: initial?.id, title: v.title, description: v.description, regionId: v.regionId, city: v.city, startDate: at(v.startDate), endDate: at(v.endDate), imageUrl: v.imageUrl, organizerId: initial?.organizerId };
    try {
      if (kind === "competition") {
        await saveCompetition({ ...base, deadline: at(v.deadline), categoryId: v.categoryId, prizeFundUzs: v.prize === "" ? undefined : Number(v.prize) }, actorId);
      } else {
        await saveFestival({ ...base, lineup: v.lineup.split("\n").map((x) => x.trim()).filter(Boolean) }, actorId);
      }
      toast.success(t("saved"));
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? t("editTitle") : t("createTitle")}</DialogTitle>
          <DialogDescription>{t(kind === "competition" ? "competition" : "festival")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          {field("ev-title", t("fieldTitle"), <Input id="ev-title" className="h-10" value={v.title} maxLength={150} onChange={(e) => set("title", e.target.value)} />)}
          {field("ev-desc", t("fieldDescription"), <Textarea id="ev-desc" rows={4} value={v.description} maxLength={5000} onChange={(e) => set("description", e.target.value)} />)}
          {field("ev-region", t("region"), <NativeSelect id="ev-region" value={v.regionId} onChange={(e) => set("regionId", e.target.value)}>{regions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>)}
          {field("ev-city", t("city"), <Input id="ev-city" className="h-10" value={v.city} maxLength={80} onChange={(e) => set("city", e.target.value)} />)}
          <div className="grid gap-3 sm:grid-cols-2">
            {field("ev-start", t("startDate"), <Input id="ev-start" className="h-10" type="date" value={v.startDate} onChange={(e) => set("startDate", e.target.value)} />)}
            {field("ev-end", t("endDate"), <Input id="ev-end" className="h-10" type="date" value={v.endDate} onChange={(e) => set("endDate", e.target.value)} />)}
          </div>
          {field("ev-image", t("image"), <CoverSelect id="ev-image" value={v.imageUrl} onChange={(x) => set("imageUrl", x)} />)}
          {kind === "competition" ? (
            <>
              {field("ev-deadline", t("deadline"), <Input id="ev-deadline" className="h-10" type="date" value={v.deadline} onChange={(e) => set("deadline", e.target.value)} />)}
              {field("ev-category", t("category"), <NativeSelect id="ev-category" value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)}>{categories.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>)}
              {field("ev-prize", t("prize"), <Input id="ev-prize" className="h-10" type="number" inputMode="numeric" min={0} value={v.prize} onChange={(e) => set("prize", e.target.value)} />)}
            </>
          ) : (
            field("ev-lineup", t("lineup"), <Textarea id="ev-lineup" rows={4} value={v.lineup} onChange={(e) => set("lineup", e.target.value)} />)
          )}
          <div aria-live="polite">{error && <p className="text-sm text-destructive">{error}</p>}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
