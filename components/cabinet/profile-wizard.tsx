"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm, type FieldPath } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormField } from "@/components/auth/form-field";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { updateTalentProfile } from "@/lib/data/client";
import { REGIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { TalentProfile } from "@/types/talent";

type Option = { value: string; label: string };
type Values = {
  fullName: string;
  specialty: string;
  bio: string;
  regionId: string;
  city: string;
  instrumentIds: string[];
  voiceTypeId: string;
  experienceYears: number;
  availability: "available" | "busy" | "open_to_offers";
  repertoire: string;
  education: { institution: string; degree: string; yearFrom: number; yearTo: number | "" }[];
  experience: { organization: string; position: string; yearFrom: number; yearTo: number | "" }[];
  phone: string;
  email: string;
  telegram: string;
  website: string;
};

const STEPS: FieldPath<Values>[][] = [
  ["fullName", "specialty", "bio", "regionId", "city"],
  ["instrumentIds", "voiceTypeId", "experienceYears", "availability", "repertoire"],
  ["education", "experience"],
  ["phone", "email", "telegram", "website"],
];
const STEP_KEYS = ["basic", "skills", "history", "contacts"] as const;
const AVAILABILITY = ["available", "busy", "open_to_offers"] as const;

const yearField = z.preprocess((v) => (v === "" || v === undefined || Number.isNaN(v) ? undefined : v), z.number().int().min(1950).max(2100).optional());

export function ProfileWizard({ talent, regions, instruments, voiceTypes }: { talent: TalentProfile; regions: Option[]; instruments: Option[]; voiceTypes: Option[] }) {
  const t = useTranslations("cabinetPage.profile");
  const ta = useTranslations("labels.availability");
  const router = useRouter();
  const [step, setStep] = useState(0);

  const req = t("errors.required");
  const schema = z.object({
    fullName: z.string().trim().min(2, req).max(80, t("errors.tooLong")),
    specialty: z.string().trim().min(2, req).max(120, t("errors.tooLong")),
    bio: z.string().max(2000, t("errors.tooLong")),
    regionId: z.string().refine((v) => REGIONS.some((r) => r.id === v), req),
    city: z.string().trim().min(1, req).max(80, t("errors.tooLong")),
    instrumentIds: z.array(z.string()).max(10, t("errors.tooMany")),
    voiceTypeId: z.string(),
    experienceYears: z.number({ error: t("errors.range") }).int(t("errors.range")).min(0, t("errors.range")).max(70, t("errors.range")),
    availability: z.enum(AVAILABILITY),
    repertoire: z.string().max(5000, t("errors.tooLong")),
    education: z.array(z.object({ institution: z.string().trim().min(1, req).max(120), degree: z.string().trim().max(120), yearFrom: z.number({ error: t("errors.range") }).int().min(1950, t("errors.range")).max(2100, t("errors.range")), yearTo: yearField })).max(20),
    experience: z.array(z.object({ organization: z.string().trim().min(1, req).max(120), position: z.string().trim().max(120), yearFrom: z.number({ error: t("errors.range") }).int().min(1950, t("errors.range")).max(2100, t("errors.range")), yearTo: yearField })).max(30),
    phone: z.string().trim().max(40),
    email: z.string().trim().max(120).refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), t("errors.email")),
    telegram: z.string().trim().max(60),
    website: z.string().trim().max(200).refine((v) => v === "" || /^https?:\/\//i.test(v), t("errors.website")),
  });

  const {
    register,
    control,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      fullName: talent.fullName,
      specialty: talent.specialty,
      bio: talent.bio,
      regionId: talent.regionId,
      city: talent.city,
      instrumentIds: talent.instrumentIds,
      voiceTypeId: talent.voiceTypeId ?? "",
      experienceYears: talent.experienceYears,
      availability: talent.availability,
      repertoire: talent.repertoire.join("\n"),
      education: talent.education.map((e) => ({ ...e, yearTo: e.yearTo ?? "" })),
      experience: talent.experience.map((e) => ({ ...e, yearTo: e.yearTo ?? "" })),
      phone: talent.contacts.phone ?? "",
      email: talent.contacts.email ?? "",
      telegram: talent.contacts.telegram ?? "",
      website: talent.contacts.website ?? "",
    },
  });
  const education = useFieldArray({ control, name: "education" });
  const experience = useFieldArray({ control, name: "experience" });

  const selected = getValues("instrumentIds");
  const [instrumentIds, setInstrumentIds] = useState<string[]>(selected);
  const toggleInstrument = (id: string, on: boolean) => {
    const next = on ? [...instrumentIds, id] : instrumentIds.filter((x) => x !== id);
    setInstrumentIds(next);
    setValue("instrumentIds", next, { shouldValidate: true });
  };

  const next = async () => {
    if (await trigger(STEPS[step])) setStep((s) => s + 1);
  };

  const onSubmit = handleSubmit(async (v) => {
    const clean = (s: string) => (s.trim() ? s.trim() : undefined);
    try {
      await updateTalentProfile(talent.id, {
        fullName: v.fullName,
        specialty: v.specialty,
        bio: v.bio,
        regionId: v.regionId,
        city: v.city,
        instrumentIds: v.instrumentIds,
        voiceTypeId: talent.kind === "vocalist" ? clean(v.voiceTypeId) : talent.voiceTypeId,
        experienceYears: v.experienceYears,
        availability: v.availability,
        repertoire: v.repertoire.split("\n").map((x) => x.trim()).filter(Boolean),
        education: v.education.map((e) => ({ institution: e.institution, degree: e.degree, yearFrom: e.yearFrom, yearTo: e.yearTo === "" ? undefined : Number(e.yearTo) })),
        experience: v.experience.map((e) => ({ organization: e.organization, position: e.position, yearFrom: e.yearFrom, yearTo: e.yearTo === "" ? undefined : Number(e.yearTo) })),
        contacts: { phone: clean(v.phone), email: clean(v.email), telegram: clean(v.telegram), website: clean(v.website) },
      });
      toast.success(t("saved"));
      router.refresh();
    } catch {
      toast.error(t("error"));
    }
  });
  const onFormSubmit = useSingleSubmit(onSubmit);

  const err = (name: FieldPath<Values>): string | undefined => {
    const parts = name.split(".");
    let cur: unknown = errors;
    for (const p of parts) cur = (cur as Record<string, unknown> | undefined)?.[p];
    return (cur as { message?: string } | undefined)?.message;
  };
  const field = (id: string, name: FieldPath<Values>, label: string, input: React.ReactNode, hint?: string) => (
    <FormField id={id} label={label} error={err(name)} hint={hint}>
      {input}
    </FormField>
  );
  const input = (id: string, name: FieldPath<Values>, extra: React.ComponentProps<"input"> = {}) => (
    <Input id={id} className="h-10" aria-invalid={!!err(name)} aria-describedby={err(name) ? `${id}-error` : undefined} {...register(name as never, extra.type === "number" ? { valueAsNumber: true } : undefined)} {...extra} />
  );

  return (
    <form onSubmit={onFormSubmit} noValidate className="flex max-w-3xl flex-col gap-6">
      <ol className="grid grid-cols-4 gap-1.5" aria-label={t("steps")}>
        {STEP_KEYS.map((k, i) => (
          <li key={k} aria-current={i === step ? "step" : undefined} className={cn("flex flex-col gap-1 border-t-2 pt-2 text-xs", i <= step ? "border-primary text-foreground" : "border-border text-muted-foreground")}>
            <span className="font-medium">{i + 1}</span>
            <span className="hidden truncate sm:block">{t(`step.${k}`)}</span>
          </li>
        ))}
      </ol>
      <h2 className="text-lg font-semibold">{t(`step.${STEP_KEYS[step]}`)}</h2>

      <div className={cn("flex flex-col gap-4", step !== 0 && "hidden")}>
        {field("p-name", "fullName", t("fullName"), input("p-name", "fullName"))}
        {field("p-specialty", "specialty", t("specialty"), input("p-specialty", "specialty"))}
        {field("p-bio", "bio", t("bio"), <Textarea id="p-bio" rows={6} aria-invalid={!!err("bio")} {...register("bio")} />)}
        {field("p-region", "regionId", t("region"), <NativeSelect id="p-region" {...register("regionId")}>{regions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>)}
        {field("p-city", "city", t("city"), input("p-city", "city"))}
      </div>

      <div className={cn("flex flex-col gap-4", step !== 1 && "hidden")}>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">{t("instruments")}</legend>
          <div className="grid max-h-56 gap-1 overflow-y-auto rounded-lg border p-2 sm:grid-cols-2">
            {instruments.map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted">
                <input type="checkbox" checked={instrumentIds.includes(o.value)} onChange={(e) => toggleInstrument(o.value, e.target.checked)} className="size-4 shrink-0 accent-primary" />
                <span className="truncate">{o.label}</span>
              </label>
            ))}
          </div>
          {err("instrumentIds") && <p className="text-xs text-destructive">{err("instrumentIds")}</p>}
        </fieldset>
        {talent.kind === "vocalist" &&
          field("p-voice", "voiceTypeId", t("voiceType"), <NativeSelect id="p-voice" {...register("voiceTypeId")}><option value="">—</option>{voiceTypes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>)}
        {field("p-exp", "experienceYears", t("experienceYears"), input("p-exp", "experienceYears", { type: "number", inputMode: "numeric", min: 0, max: 70 }))}
        {field("p-avail", "availability", t("availability"), <NativeSelect id="p-avail" {...register("availability")}>{AVAILABILITY.map((a) => <option key={a} value={a}>{ta(a)}</option>)}</NativeSelect>)}
        {field("p-rep", "repertoire", t("repertoire"), <Textarea id="p-rep" rows={5} aria-invalid={!!err("repertoire")} {...register("repertoire")} />, t("repertoireHint"))}
      </div>

      <div className={cn("flex flex-col gap-6", step !== 2 && "hidden")}>
        <section className="flex flex-col gap-3" aria-labelledby="edu">
          <h3 id="edu" className="text-sm font-semibold">{t("education")}</h3>
          {education.fields.map((f, i) => (
            <div key={f.id} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2">
              {field(`edu-${i}-inst`, `education.${i}.institution`, t("institution"), input(`edu-${i}-inst`, `education.${i}.institution`))}
              {field(`edu-${i}-deg`, `education.${i}.degree`, t("degree"), input(`edu-${i}-deg`, `education.${i}.degree`))}
              {field(`edu-${i}-from`, `education.${i}.yearFrom`, t("yearFrom"), input(`edu-${i}-from`, `education.${i}.yearFrom`, { type: "number", inputMode: "numeric" }))}
              {field(`edu-${i}-to`, `education.${i}.yearTo`, t("yearTo"), input(`edu-${i}-to`, `education.${i}.yearTo`, { type: "number", inputMode: "numeric" }))}
              <Button type="button" variant="ghost" size="sm" className="w-fit sm:col-span-2" onClick={() => education.remove(i)}>
                <Trash2 aria-hidden />
                {t("remove")}
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => education.append({ institution: "", degree: "", yearFrom: new Date().getFullYear(), yearTo: "" })}>
            <Plus aria-hidden />
            {t("addEducation")}
          </Button>
        </section>
        <section className="flex flex-col gap-3" aria-labelledby="exp">
          <h3 id="exp" className="text-sm font-semibold">{t("experience")}</h3>
          {experience.fields.map((f, i) => (
            <div key={f.id} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2">
              {field(`exp-${i}-org`, `experience.${i}.organization`, t("organization"), input(`exp-${i}-org`, `experience.${i}.organization`))}
              {field(`exp-${i}-pos`, `experience.${i}.position`, t("position"), input(`exp-${i}-pos`, `experience.${i}.position`))}
              {field(`exp-${i}-from`, `experience.${i}.yearFrom`, t("yearFrom"), input(`exp-${i}-from`, `experience.${i}.yearFrom`, { type: "number", inputMode: "numeric" }))}
              {field(`exp-${i}-to`, `experience.${i}.yearTo`, t("yearTo"), input(`exp-${i}-to`, `experience.${i}.yearTo`, { type: "number", inputMode: "numeric" }))}
              <Button type="button" variant="ghost" size="sm" className="w-fit sm:col-span-2" onClick={() => experience.remove(i)}>
                <Trash2 aria-hidden />
                {t("remove")}
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => experience.append({ organization: "", position: "", yearFrom: new Date().getFullYear(), yearTo: "" })}>
            <Plus aria-hidden />
            {t("addExperience")}
          </Button>
        </section>
      </div>

      <div className={cn("flex flex-col gap-4", step !== 3 && "hidden")}>
        {field("p-phone", "phone", t("phone"), input("p-phone", "phone", { type: "tel", autoComplete: "tel" }))}
        {field("p-email", "email", t("email"), input("p-email", "email", { type: "email", autoComplete: "email" }))}
        {field("p-telegram", "telegram", t("telegram"), input("p-telegram", "telegram"))}
        {field("p-website", "website", t("website"), input("p-website", "website", { type: "url" }), "https://")}
      </div>

      <div className="flex flex-wrap justify-between gap-2">
        <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          {t("back")}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next}>
            {t("next")}
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("saving") : t("save")}
          </Button>
        )}
      </div>
    </form>
  );
}
