import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/components/auth/auth-heading";
import { InvalidLink } from "@/components/auth/invalid-link";
import { TwoFactorForm } from "@/components/auth/two-factor-form";
import { parseTwoFactorRole } from "@/lib/auth/flow";
import { isDemoEnabled } from "@/lib/demo/role";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("twoFactorTitle") };
}

export default async function TwoFactorPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = (await searchParams).role;
  const role = parseTwoFactorRole(Array.isArray(raw) ? raw[0] : raw);
  if (!role) return <InvalidLink href="/login" />;

  const t = await getTranslations("auth");
  return (
    <>
      <AuthHeading title={t("twoFactorTitle")} text={t("twoFactorText")} />
      <TwoFactorForm role={role} showDemoCode={isDemoEnabled()} />
    </>
  );
}
