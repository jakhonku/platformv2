"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, FileUp, Mic2, Music, PenLine, Trash2, UsersRound, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Link, useRouter } from "@/i18n/navigation";
import { parseContact } from "@/lib/auth/contact";
import { REGISTERABLE_ROLES } from "@/lib/auth/flow";
import { registerAccount } from "@/lib/data/client";
import { DataError } from "@/lib/data/errors";
import type { Role } from "@/lib/demo/role";
import { formatBytes, UPLOAD_RULES, validateUpload } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { ContactField } from "./contact-field";
import { FormField } from "./form-field";
import { OneIdDialog } from "./oneid-dialog";
import { PasswordInput } from "./password-input";

const ICONS: Record<(typeof REGISTERABLE_ROLES)[number], typeof Music> = {
  musician: Music,
  vocalist: Mic2,
  conductor: Wand2,
  composer: PenLine,
  collective: UsersRound,
  organization: Building2,
};
const ORG_KINDS = ["philharmonic", "theatre", "conservatory", "college", "school", "festival_org", "agency"] as const;

type Channel = "phone" | "email";
type Values = {
  fullName: string;
  channel: Channel;
  contact: string;
  password: string;
  confirm: string;
  terms: boolean;
  entityName: string;
  stir: string;
  collectiveType: "orchestra" | "choir";
  orgKind: (typeof ORG_KINDS)[number];
};
type Doc = { name: string; size: number };

export function RegisterForm() {
  const t = useTranslations("auth");
  const tr = useTranslations("roles");
  const tk = useTranslations("catalog.orgKind");
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [docError, setDocError] = useState<string | null>(null);
  const isOrg = role === "organization";
  const isEntity = isOrg || role === "collective";

  const schema = z
    .object({
      fullName: z.string().trim().min(2, t("errors.fullName")).max(80, t("errors.fullName")),
      channel: z.enum(["phone", "email"]),
      contact: z.string(),
      password: z.string().min(8, t("errors.passwordLength")),
      confirm: z.string(),
      terms: z.boolean().refine((v) => v, t("errors.terms")),
      entityName: z.string(),
      stir: z.string(),
      collectiveType: z.enum(["orchestra", "choir"]),
      orgKind: z.enum(ORG_KINDS),
    })
    .superRefine((v, ctx) => {
      const parsed = parseContact(v.contact);
      if (!parsed || parsed.channel !== v.channel) ctx.addIssue({ code: "custom", path: ["contact"], message: t("errors.contact") });
      if (v.confirm !== v.password) ctx.addIssue({ code: "custom", path: ["confirm"], message: t("errors.passwordMismatch") });
      if (isEntity && v.entityName.trim().length < 2) ctx.addIssue({ code: "custom", path: ["entityName"], message: t("errors.entityName") });
      if (isOrg && !/^\d{9}$/.test(v.stir.trim())) ctx.addIssue({ code: "custom", path: ["stir"], message: t("errors.stir") });
    });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", channel: "phone", contact: "", password: "", confirm: "", terms: false, entityName: "", stir: "", collectiveType: "orchestra", orgKind: "agency" },
  });
  const channel = useWatch({ control, name: "channel" });

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next = [...docs];
    for (const f of Array.from(files)) {
      const verdict = validateUpload("document", f.name, f.size);
      if (!verdict.ok) {
        setDocError(t("errors.docFormat", { formats: UPLOAD_RULES.document.extensions.join(", ").toUpperCase(), size: formatBytes(UPLOAD_RULES.document.maxBytes) }));
        continue;
      }
      setDocError(null);
      if (next.length < 5) next.push({ name: f.name, size: f.size });
    }
    setDocs(next);
  }

  const onSubmit = handleSubmit(async (v) => {
    if (!role) return;
    setFormError(null);
    if (isEntity && docs.length === 0) return setFormError(t("errors.documents"));
    try {
      const contact = parseContact(v.contact)!.value;
      await registerAccount({
        role,
        fullName: v.fullName,
        contact,
        password: v.password,
        ...(isEntity ? { entityName: v.entityName, documents: docs } : {}),
        ...(isOrg ? { stir: v.stir.trim(), orgKind: v.orgKind } : {}),
        ...(role === "collective" ? { collectiveType: v.collectiveType } : {}),
      });
      router.push(`/verify?contact=${encodeURIComponent(contact)}&role=${role}`);
    } catch (error) {
      const code = error instanceof DataError ? error.code : undefined;
      setFormError(code === "duplicate" ? t("errors.duplicate") : code === "invalid" ? t("errors.invalid") : t("errors.generic"));
    }
  });
  const onFormSubmit = useSingleSubmit(onSubmit);

  const loginLink = (
    <p className="text-center text-sm text-muted-foreground">
      {t("haveAccount")}{" "}
      <Link href="/login" className="font-medium text-primary hover:underline">
        {t("login")}
      </Link>
    </p>
  );

  if (step === 1) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-xs font-medium text-muted-foreground">{t("steps.role")}</p>
        <div role="radiogroup" aria-label={t("steps.role")} className="grid gap-2 sm:grid-cols-2">
          {REGISTERABLE_ROLES.map((r) => {
            const Icon = ICONS[r];
            const selected = role === r;
            return (
              <label
                key={r}
                className={cn(
                  "flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors focus-within:ring-3 focus-within:ring-ring/50 hover:bg-muted",
                  selected && "border-primary bg-primary/10",
                )}
              >
                <input type="radio" name="role" value={r} checked={selected} onChange={() => setRole(r)} className="sr-only" />
                <Icon className={cn("mt-0.5 size-5 shrink-0", selected ? "text-primary" : "text-muted-foreground")} aria-hidden />
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium">{tr(r)}</span>
                  <span className="text-xs text-muted-foreground">{t(`roleDesc.${r}`)}</span>
                </span>
              </label>
            );
          })}
        </div>
        <Button size="lg" disabled={!role} onClick={() => setStep(2)}>
          {t("continue")}
        </Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
          <span className="h-px flex-1 bg-border" />
          {t("or")}
          <span className="h-px flex-1 bg-border" />
        </div>
        <OneIdDialog />
        <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">{t("moderationNote")}</p>
        {loginLink}
      </div>
    );
  }

  return (
    <form onSubmit={onFormSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          {t("steps.details")} · {role ? tr(role) : ""}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>
          {t("back")}
        </Button>
      </div>

      {isEntity && (
        <FormField id="reg-entity" label={t(isOrg ? "entityName.organization" : "entityName.collective")} error={errors.entityName?.message}>
          <Input id="reg-entity" className="h-10" aria-invalid={!!errors.entityName} aria-describedby={errors.entityName ? "reg-entity-error" : undefined} {...register("entityName")} />
        </FormField>
      )}
      {role === "collective" && (
        <FormField id="reg-ctype" label={t("collectiveType.label")}>
          <NativeSelect id="reg-ctype" {...register("collectiveType")}>
            <option value="orchestra">{t("collectiveType.orchestra")}</option>
            <option value="choir">{t("collectiveType.choir")}</option>
          </NativeSelect>
        </FormField>
      )}
      {isOrg && (
        <>
          <FormField id="reg-kind" label={t("orgKind")}>
            <NativeSelect id="reg-kind" {...register("orgKind")}>
              {ORG_KINDS.map((k) => (
                <option key={k} value={k}>
                  {tk(k)}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField id="reg-stir" label={t("stir")} hint={t("stirHint")} error={errors.stir?.message}>
            <Input id="reg-stir" className="h-10" inputMode="numeric" maxLength={9} aria-invalid={!!errors.stir} aria-describedby={errors.stir ? "reg-stir-error" : undefined} {...register("stir")} />
          </FormField>
        </>
      )}

      <FormField id="reg-name" label={isEntity ? t("representative") : t("fullName")} error={errors.fullName?.message}>
        <Input id="reg-name" className="h-10" autoComplete="name" aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "reg-name-error" : undefined} {...register("fullName")} />
      </FormField>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">{t("channel.label")}</legend>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1" role="radiogroup">
          {(["phone", "email"] as const).map((c) => (
            <label
              key={c}
              className={cn(
                "flex h-9 cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors focus-within:ring-3 focus-within:ring-ring/50",
                channel === c ? "bg-background shadow-sm" : "text-muted-foreground",
              )}
            >
              <input type="radio" value={c} className="sr-only" {...register("channel", { onChange: () => setValue("contact", "") })} />
              {t(`channel.${c}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <FormField id="reg-contact" label={t("contact")} error={errors.contact?.message}>
        <Controller control={control} name="contact" render={({ field }) => <ContactField id="reg-contact" channel={channel} value={field.value} onChange={field.onChange} error={errors.contact?.message} />} />
      </FormField>
      <FormField id="reg-password" label={t("password")} hint={t("passwordHint")} error={errors.password?.message}>
        <PasswordInput id="reg-password" autoComplete="new-password" aria-invalid={!!errors.password} aria-describedby={errors.password ? "reg-password-error" : undefined} {...register("password")} />
      </FormField>
      <FormField id="reg-confirm" label={t("confirmPassword")} error={errors.confirm?.message}>
        <PasswordInput id="reg-confirm" autoComplete="new-password" aria-invalid={!!errors.confirm} aria-describedby={errors.confirm ? "reg-confirm-error" : undefined} {...register("confirm")} />
      </FormField>

      {isEntity && (
        <fieldset className="flex flex-col gap-2 rounded-xl border p-3">
          <legend className="px-1 text-sm font-medium">{t("documents.label")}</legend>
          <p className="text-xs text-muted-foreground">{t(isOrg ? "documents.hintOrg" : "documents.hintCollective")}</p>
          <p className="text-xs text-muted-foreground">{t("documents.limit", { formats: UPLOAD_RULES.document.extensions.join(", ").toUpperCase(), size: formatBytes(UPLOAD_RULES.document.maxBytes) })}</p>
          <ul className="flex flex-col gap-1">
            {docs.map((d, i) => (
              <li key={`${d.name}-${i}`} className="flex items-center justify-between gap-2 rounded-lg bg-muted px-2 py-1 text-sm">
                <span className="min-w-0 truncate">
                  {d.name} · {formatBytes(d.size)}
                </span>
                <button type="button" aria-label={t("documents.remove")} onClick={() => setDocs((cur) => cur.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-foreground">
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <input ref={fileInput} type="file" multiple className="sr-only" tabIndex={-1} accept={UPLOAD_RULES.document.extensions.map((x) => `.${x}`).join(",")} onChange={(e) => (addFiles(e.target.files), (e.target.value = ""))} />
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => fileInput.current?.click()}>
            <FileUp aria-hidden />
            {t("documents.add")}
          </Button>
          <div aria-live="polite">{docError && <p className="text-xs text-destructive">{docError}</p>}</div>
        </fieldset>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-terms" className="flex cursor-pointer items-start gap-2 text-sm">
          <input id="reg-terms" type="checkbox" aria-invalid={!!errors.terms} className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary" {...register("terms")} />
          <span>{t("terms")}</span>
        </label>
        {errors.terms && <p className="text-xs text-destructive">{errors.terms.message}</p>}
      </div>
      <div aria-live="polite">{formError && <p className="text-sm text-destructive">{formError}</p>}</div>
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {t("register")}
      </Button>
      {loginLink}
    </form>
  );
}
