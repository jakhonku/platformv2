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
  const params = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const role = parseTwoFactorRole(first(params.role));
  const userParam = first(params.user);
  const userId = userParam && /^[A-Za-z0-9_-]{1,60}$/.test(userParam) ? userParam : undefined;
  if (!role) return <InvalidLink href="/login" />;

  const t = await getTranslations("auth");
  return (
    <>
      <AuthHeading title={t("twoFactorTitle")} text={t("twoFactorText")} />
      <TwoFactorForm role={role} userId={userId} showDemoCode={isDemoEnabled()} />
    </>
  );
}
