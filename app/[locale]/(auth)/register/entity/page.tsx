import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/components/auth/auth-heading";
import { RegisterForm } from "@/components/auth/register-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("registerTitle") };
}

/** Jamoa va tashkilotlar uchun hujjatli ro'yxatdan o'tish (moderator tasdiqlaydi) */
export default async function RegisterEntityPage() {
  const t = await getTranslations("auth");
  return (
    <>
      <AuthHeading title={t("registerTitle")} text={t("registerText")} />
      <RegisterForm />
    </>
  );
}
