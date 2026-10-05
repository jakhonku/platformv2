"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { parseContact } from "@/lib/auth/contact";
import { login } from "@/lib/data/client";
import { DataError } from "@/lib/data/errors";
import { FormField } from "./form-field";
import { OneIdButton } from "./oneid-button";
import { PasswordInput } from "./password-input";
import { useSignIn } from "./use-sign-in";

type Values = { identifier: string; password: string };

export function LoginForm({ showDemoHint }: { showDemoHint: boolean }) {
  const t = useTranslations("auth");
  const signIn = useSignIn();
  const [formError, setFormError] = useState<string | null>(null);

  const schema = z.object({
    identifier: z.string().refine((v) => parseContact(v) !== null, t("errors.identifier")),
    password: z.string().min(8, t("errors.passwordLength")),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { identifier: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const res = await login(values);
      await signIn.afterCredentials(res.role);
    } catch (error) {
      const code = error instanceof DataError ? error.code : undefined;
      setFormError(code === "not_found" ? t("errors.notFound") : code === "forbidden" ? t("errors.forbidden") : code === "invalid" ? t("errors.invalid") : t("errors.generic"));
    }
  });
  const onFormSubmit = useSingleSubmit(onSubmit);

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onFormSubmit} noValidate className="flex flex-col gap-4">
        <FormField id="login-identifier" label={t("identifier")} error={errors.identifier?.message}>
          <Input
            id="login-identifier"
            className="h-10"
            autoComplete="username"
            aria-invalid={!!errors.identifier}
            aria-describedby={errors.identifier ? "login-identifier-error" : undefined}
            {...register("identifier")}
          />
        </FormField>
        <FormField id="login-password" label={t("password")} error={errors.password?.message}>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            {...register("password")}
          />
        </FormField>
        <div aria-live="polite" className="min-h-0">
          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {t("login")}
        </Button>
        <Link href="/forgot-password" className="w-fit self-center text-sm text-primary hover:underline">
          {t("forgot")}
        </Link>
      </form>
      <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        {t("or")}
        <span className="h-px flex-1 bg-border" />
      </div>
      <OneIdButton />
      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t("register")}
        </Link>
      </p>
      {showDemoHint && <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">{t("demoAccounts")}</p>}
    </div>
  );
}
