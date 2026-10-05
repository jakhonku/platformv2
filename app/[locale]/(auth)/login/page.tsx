import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/components/auth/auth-heading";
import { RolePicker } from "@/components/auth/role-picker";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("loginTitle") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth.picker");
  return (
    <>
      <AuthHeading title={t("title")} text={t("text")} />
      <RolePicker />
    </>
  );
}
