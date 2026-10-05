"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { parseContact } from "@/lib/auth/contact";
import { FormField } from "./form-field";

type Values = { identifier: string };

export function ForgotForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const schema = z.object({ identifier: z.string().refine((v) => parseContact(v) !== null, t("errors.identifier")) });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { identifier: "" } });

  // Mock: foydalanuvchi mavjudligi oshkor qilinmaydi (maxfiylik), har doim kod ekraniga o'tadi
  const onSubmit = handleSubmit(async ({ identifier }) => {
    const contact = parseContact(identifier)!.value;
    router.push(`/reset-password?contact=${encodeURIComponent(contact)}`);
  });
  const onFormSubmit = useSingleSubmit(onSubmit);

  return (
    <form onSubmit={onFormSubmit} noValidate className="flex flex-col gap-4">
      <FormField id="forgot-identifier" label={t("identifier")} error={errors.identifier?.message}>
        <Input
          id="forgot-identifier"
          className="h-10"
          autoComplete="username"
          aria-invalid={!!errors.identifier}
          aria-describedby={errors.identifier ? "forgot-identifier-error" : undefined}
          {...register("identifier")}
        />
      </FormField>
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {t("sendCode")}
      </Button>
      <Link href="/login" className="w-fit self-center text-sm text-primary hover:underline">
        {t("backToLogin")}
      </Link>
    </form>
  );
}
