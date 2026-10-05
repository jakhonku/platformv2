import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/components/auth/auth-heading";
import { InvalidLink } from "@/components/auth/invalid-link";
import { ResetForm } from "@/components/auth/reset-form";
import { parseContact } from "@/lib/auth/contact";
import { isDemoEnabled } from "@/lib/demo/role";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("resetTitle") };
}

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = (await searchParams).contact;
  const contact = parseContact((Array.isArray(raw) ? raw[0] : raw) ?? "");
  if (!contact) return <InvalidLink href="/forgot-password" />;

  const t = await getTranslations("auth");
  return (
    <>
      <AuthHeading title={t("resetTitle")} text={t("resetText", { contact: contact.value })} />
      <ResetForm showDemoCode={isDemoEnabled()} />
    </>
  );
}
