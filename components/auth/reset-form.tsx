"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { FormField } from "./form-field";
import { OtpPanel } from "./otp-panel";
import { PasswordInput } from "./password-input";

type Values = { password: string; confirm: string };

/** 1-qadam: kod, 2-qadam: yangi parol */
export function ResetForm({ showDemoCode }: { showDemoCode: boolean }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  const schema = z
    .object({ password: z.string().min(8, t("errors.passwordLength")), confirm: z.string() })
    .refine((v) => v.password === v.confirm, { path: ["confirm"], message: t("errors.passwordMismatch") });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { password: "", confirm: "" } });

  const onSubmit = handleSubmit(async () => {
    toast.success(t("resetDone"));
    router.push("/login");
  });
  const onFormSubmit = useSingleSubmit(onSubmit);

  if (!verified) return <OtpPanel idPrefix="reset" showDemoCode={showDemoCode} onVerified={() => setVerified(true)} />;

  return (
    <form onSubmit={onFormSubmit} noValidate className="flex flex-col gap-4">
      <FormField id="reset-password" label={t("newPassword")} hint={t("passwordHint")} error={errors.password?.message}>
        <PasswordInput id="reset-password" autoComplete="new-password" aria-invalid={!!errors.password} aria-describedby={errors.password ? "reset-password-error" : undefined} {...register("password")} />
      </FormField>
      <FormField id="reset-confirm" label={t("confirmPassword")} error={errors.confirm?.message}>
        <PasswordInput id="reset-confirm" autoComplete="new-password" aria-invalid={!!errors.confirm} aria-describedby={errors.confirm ? "reset-confirm-error" : undefined} {...register("confirm")} />
      </FormField>
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {t("savePassword")}
      </Button>
    </form>
  );
}
