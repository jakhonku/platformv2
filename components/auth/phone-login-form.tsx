"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { localPhone } from "@/lib/auth/contact";
import { loginWithPhone, requestLoginCode } from "@/lib/data/client";
import { DataError } from "@/lib/data/errors";
import type { Role } from "@/lib/demo/role";
import { ContactField } from "./contact-field";
import { FormField } from "./form-field";
import { OtpPanel } from "./otp-panel";
import { useSignIn } from "./use-sign-in";

/** Telefon raqami + SMS kod bilan kirish */
export function PhoneLoginForm({ showDemoCode }: { showDemoCode: boolean }) {
  const t = useTranslations("onboarding.login");
  const tr = useTranslations("onboarding.register");
  const signIn = useSignIn();
  const result = useRef<{ userId: string; role: Role } | null>(null);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "code">("form");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (!localPhone(phone)) return setError(tr("errors.phone"));
    setPending(true);
    try {
      await requestLoginCode({ phone });
      setError(undefined);
      setStep("code");
    } catch (err) {
      setError(err instanceof DataError && err.code === "not_found" ? t("notFound") : tr("errors.generic"));
    } finally {
      setPending(false);
    }
  });

  if (step === "code") {
    return (
      <div className="flex flex-col gap-5">
        <p className="text-sm text-foreground/65">{tr("codeText", { phone })}</p>
        <OtpPanel
          idPrefix="login"
          showDemoCode={showDemoCode}
          verify={async (code) => {
            result.current = await loginWithPhone({ phone, code });
          }}
          onVerified={() => signIn.afterCredentials(result.current?.role ?? "member", result.current?.userId)}
        />
        <Button type="button" variant="ghost" className="w-fit" onClick={() => setStep("form")}>
          {tr("changeNumber")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField id="login-phone" label={tr("phone")} error={error}>
        <ContactField id="login-phone" channel="phone" value={phone} onChange={(v) => { setPhone(v); setError(undefined); }} error={error} />
      </FormField>
      <Button type="submit" size="lg" className="h-11 rounded-full" disabled={pending}>
        {pending ? tr("sending") : t("sendCode")}
      </Button>
    </form>
  );
}
