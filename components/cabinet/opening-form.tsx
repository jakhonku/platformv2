"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { createCasting, createVacancy } from "@/lib/data/client";
import type { Requirements } from "@/types/opportunity";

type Option = { value: string; label: string };
export type OpeningOptions = { regions: Option[]; instruments: Option[]; voiceTypes: Option[] };

const KINDS = ["musician", "vocalist", "conductor", "composer"] as const;
const EMPLOYMENT = ["full_time", "part_time", "contract"] as const;

const toIsoEnd = (day: string) => `${day}T18:00:00.000Z`;

/** Kasting yoki vakansiya yaratish dialogi */
export function OpeningForm({ kind, orgId, options }: { kind: "casting" | "vacancy"; orgId: string; options: OpeningOptions }) {
  const t = useTranslations("cabinetPage.openings");
  const tl = useTranslations("labels");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [v, setV] = useState({
    title: "",
    description: "",
    deadline: "",
    location: "",
    eventDate: "",
    employment: "full_time" as (typeof EMPLOYMENT)[number],
    regionId: options.regions[0]?.value ?? "",
    city: "",
    salaryFrom: "",
    salaryTo: "",
    instrumentId: "",
    voiceTypeId: "",
    minExperience: "",
    kinds: [] as (typeof KINDS)[number][],
  });
  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) => (setV((s) => ({ ...s, [key]: value })), setError(null));
  const today = new Date().toISOString().slice(0, 10);

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (v.title.trim().length < 5) return setError(t("errors.title"));
    if (v.description.trim().length < 20) return setError(t("errors.description"));
    if (!v.deadline || v.deadline < today) return setError(t("errors.deadline"));
    if (kind === "casting" && (v.location.trim().length < 2 || !v.eventDate)) return setError(t("errors.casting"));
    if (kind === "vacancy" && (!v.city.trim() || !v.regionId)) return setError(t("errors.vacancy"));
    const from = v.salaryFrom === "" ? undefined : Number(v.salaryFrom);
    const to = v.salaryTo === "" ? undefined : Number(v.salaryTo);
    if (from !== undefined && to !== undefined && from > to) return setError(t("errors.salary"));

    const requirements: Requirements = {
      ...(v.kinds.length ? { kinds: v.kinds } : {}),
      ...(v.instrumentId ? { instrumentIds: [v.instrumentId] } : {}),
      ...(v.voiceTypeId ? { voiceTypeIds: [v.voiceTypeId] } : {}),
      ...(v.minExperience ? { minExperience: Number(v.minExperience) } : {}),
    };
    try {
      if (kind === "casting") {
        await createCasting(orgId, { title: v.title, description: v.description, location: v.location, eventDate: toIsoEnd(v.eventDate), deadline: toIsoEnd(v.deadline), requirements });
      } else {
        await createVacancy(orgId, { title: v.title, description: v.description, employment: v.employment, regionId: v.regionId, city: v.city, salaryFromUzs: from, salaryToUzs: to, deadline: toIsoEnd(v.deadline), requirements });
      }
      toast.success(t("created"));
      setOpen(false);
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
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        {t(kind === "casting" ? "createCasting" : "createVacancy")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t(kind === "casting" ? "createCasting" : "createVacancy")}</DialogTitle>
            <DialogDescription>{t("formText")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            {field(`${kind}-title`, t("fieldTitle"), <Input id={`${kind}-title`} className="h-10" value={v.title} maxLength={150} onChange={(e) => set("title", e.target.value)} />)}
            {field(`${kind}-desc`, t("fieldDescription"), <Textarea id={`${kind}-desc`} rows={4} value={v.description} maxLength={5000} onChange={(e) => set("description", e.target.value)} />)}
            {field(`${kind}-deadline`, t("deadline"), <Input id={`${kind}-deadline`} className="h-10" type="date" min={today} value={v.deadline} onChange={(e) => set("deadline", e.target.value)} />)}
            {kind === "casting" ? (
              <>
                {field("c-location", t("location"), <Input id="c-location" className="h-10" value={v.location} maxLength={150} onChange={(e) => set("location", e.target.value)} />)}
                {field("c-event", t("eventDate"), <Input id="c-event" className="h-10" type="date" min={today} value={v.eventDate} onChange={(e) => set("eventDate", e.target.value)} />)}
              </>
            ) : (
              <>
                {field("v-employment", t("employment"), <NativeSelect id="v-employment" value={v.employment} onChange={(e) => set("employment", e.target.value as (typeof EMPLOYMENT)[number])}>{EMPLOYMENT.map((x) => <option key={x} value={x}>{tl(`employment.${x}`)}</option>)}</NativeSelect>)}
                {field("v-region", t("region"), <NativeSelect id="v-region" value={v.regionId} onChange={(e) => set("regionId", e.target.value)}>{options.regions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>)}
                {field("v-city", t("city"), <Input id="v-city" className="h-10" value={v.city} maxLength={80} onChange={(e) => set("city", e.target.value)} />)}
                <div className="grid grid-cols-2 gap-3">
                  {field("v-from", t("salaryFrom"), <Input id="v-from" className="h-10" type="number" inputMode="numeric" min={0} value={v.salaryFrom} onChange={(e) => set("salaryFrom", e.target.value)} />)}
                  {field("v-to", t("salaryTo"), <Input id="v-to" className="h-10" type="number" inputMode="numeric" min={0} value={v.salaryTo} onChange={(e) => set("salaryTo", e.target.value)} />)}
                </div>
              </>
            )}
            <fieldset className="flex flex-col gap-3 rounded-xl border p-3">
              <legend className="px-1 text-sm font-medium">{t("requirements")}</legend>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {KINDS.map((k) => (
                  <label key={k} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" checked={v.kinds.includes(k)} onChange={(e) => set("kinds", e.target.checked ? [...v.kinds, k] : v.kinds.filter((x) => x !== k))} className="size-4 accent-primary" />
                    {tl(`talentKind.${k}`)}
                  </label>
                ))}
              </div>
              {field(`${kind}-instrument`, t("instrument"), <NativeSelect id={`${kind}-instrument`} value={v.instrumentId} onChange={(e) => set("instrumentId", e.target.value)}><option value="">—</option>{options.instruments.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>)}
              {field(`${kind}-voice`, t("voice"), <NativeSelect id={`${kind}-voice`} value={v.voiceTypeId} onChange={(e) => set("voiceTypeId", e.target.value)}><option value="">—</option>{options.voiceTypes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>)}
              {field(`${kind}-exp`, t("minExperience"), <Input id={`${kind}-exp`} className="h-10" type="number" inputMode="numeric" min={0} max={60} value={v.minExperience} onChange={(e) => set("minExperience", e.target.value)} />)}
            </fieldset>
            <div aria-live="polite">{error && <p className="text-sm text-destructive">{error}</p>}</div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit">{t("submit")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
