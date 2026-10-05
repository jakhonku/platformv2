"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mic2, Music, PenLine, UsersRound, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { parseContact } from "@/lib/auth/contact";
import { REGISTERABLE_ROLES } from "@/lib/auth/flow";
import { registerAccount } from "@/lib/data/client";
import { DataError } from "@/lib/data/errors";
import type { Role } from "@/lib/demo/role";
import { cn } from "@/lib/utils";
import { ContactField } from "./contact-field";
import { FormField } from "./form-field";
import { PasswordInput } from "./password-input";

const ICONS: Record<(typeof REGISTERABLE_ROLES)[number], typeof Music> = {
  musician: Music,
  vocalist: Mic2,
  conductor: Wand2,
  composer: PenLine,
  collective: UsersRound,
  organization: Building2,
};

type Channel = "phone" | "email";
type Values = { fullName: string; channel: Channel; contact: string; password: string; confirm: string; terms: boolean };

export function RegisterForm() {
  const t = useTranslations("auth");
  const tr = useTranslations("roles");
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [formError, setFormError] = useState<string | null>(null);

  const schema = z
    .object({
      fullName: z.string().trim().min(2, t("errors.fullName")).max(80, t("errors.fullName")),
      channel: z.enum(["phone", "email"]),
      contact: z.string(),
      password: z.string().min(8, t("errors.passwordLength")),
      confirm: z.string(),
      terms: z.boolean().refine((v) => v, t("errors.terms")),
    })
    .superRefine((v, ctx) => {
      const parsed = parseContact(v.contact);
      if (!parsed || parsed.channel !== v.channel) ctx.addIssue({ code: "custom", path: ["contact"], message: t("errors.contact") });
      if (v.confirm !== v.password) ctx.addIssue({ code: "custom", path: ["confirm"], message: t("errors.passwordMismatch") });
    });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", channel: "phone", contact: "", password: "", confirm: "", terms: false },
  });
  const channel = useWatch({ control, name: "channel" });

  const onSubmit = handleSubmit(async (v) => {
    if (!role) return;
    setFormError(null);
    try {
      const contact = parseContact(v.contact)!.value;
      await registerAccount({ role, fullName: v.fullName, contact, password: v.password });
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
      <FormField id="reg-name" label={t("fullName")} error={errors.fullName?.message}>
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
              <input
                type="radio"
                value={c}
                className="sr-only"
                {...register("channel", { onChange: () => setValue("contact", "") })}
              />
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
