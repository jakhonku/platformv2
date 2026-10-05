"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { localPhone } from "@/lib/auth/contact";
import { registerMember, requestRegistrationCode } from "@/lib/data/client";
import { DataError } from "@/lib/data/errors";
import { ContactField } from "./contact-field";
import { FormField } from "./form-field";
import { OtpPanel } from "./otp-panel";
import { useSignIn } from "./use-sign-in";

type Errors = Partial<Record<"lastName" | "firstName" | "middleName" | "phone" | "form", string>>;

/** 1-bosqich: F.I.Sh. + telefon -> SMS kod -> tasdiqlanmagan hisob yaratiladi va kabinetga kiriladi */
export function PhoneRegisterForm({ showDemoCode }: { showDemoCode: boolean }) {
  const t = useTranslations("onboarding.register");
  const signIn = useSignIn();
  const created = useRef<string | null>(null);
  const [step, setStep] = useState<"form" | "code">("form");
  const [values, setValues] = useState({ lastName: "", firstName: "", middleName: "", phone: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);

  const set = (key: keyof typeof values) => (v: string) => {
    setValues((s) => ({ ...s, [key]: v }));
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  };

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    const next: Errors = {};
    if (values.lastName.trim().length < 2) next.lastName = t("errors.name");
    if (values.firstName.trim().length < 2) next.firstName = t("errors.name");
    if (values.middleName.trim() && values.middleName.trim().length < 2) next.middleName = t("errors.name");
    if (!localPhone(values.phone)) next.phone = t("errors.phone");
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setPending(true);
    try {
      await requestRegistrationCode({ phone: values.phone });
      setStep("code");
    } catch (err) {
      setErrors({ form: err instanceof DataError && err.code === "duplicate" ? t("errors.duplicate") : t("errors.generic") });
    } finally {
      setPending(false);
    }
  });

  if (step === "code") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">{t("codeTitle")}</h2>
          <p className="text-sm text-foreground/65">{t("codeText", { phone: values.phone })}</p>
        </div>
        <OtpPanel
          idPrefix="register"
          showDemoCode={showDemoCode}
          verify={async (code) => {
            created.current = (await registerMember({ ...values, code })).userId;
          }}
          onVerified={() => signIn.afterCredentials("member", created.current ?? undefined)}
        />
        <Button type="button" variant="ghost" className="w-fit" onClick={() => setStep("form")}>
          {t("changeNumber")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField id="reg-last" label={t("lastName")} error={errors.lastName}>
        <Input id="reg-last" autoComplete="family-name" value={values.lastName} aria-invalid={!!errors.lastName} onChange={(e) => set("lastName")(e.target.value)} className="h-10" />
      </FormField>
      <FormField id="reg-first" label={t("firstName")} error={errors.firstName}>
        <Input id="reg-first" autoComplete="given-name" value={values.firstName} aria-invalid={!!errors.firstName} onChange={(e) => set("firstName")(e.target.value)} className="h-10" />
      </FormField>
      <FormField id="reg-middle" label={`${t("middleName")} (${t("optional")})`} error={errors.middleName}>
        <Input id="reg-middle" autoComplete="additional-name" value={values.middleName} aria-invalid={!!errors.middleName} onChange={(e) => set("middleName")(e.target.value)} className="h-10" />
      </FormField>
      <FormField id="reg-phone" label={t("phone")} error={errors.phone}>
        <ContactField id="reg-phone" channel="phone" value={values.phone} onChange={set("phone")} error={errors.phone} />
      </FormField>
      {errors.form && (
        <p role="alert" className="text-sm text-destructive">
          {errors.form}{" "}
          {errors.form === t("errors.duplicate") && (
            <Link href="/login" className="font-medium underline">
              {t("login")}
            </Link>
          )}
        </p>
      )}
      <Button type="submit" size="lg" className="h-11 rounded-full" disabled={pending}>
        {pending ? t("sending") : t("sendCode")}
      </Button>
      <p className="text-xs leading-relaxed text-foreground/55">{t("note")}</p>
    </form>
  );
}
