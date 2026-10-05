import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/components/auth/auth-heading";
import { InvalidLink } from "@/components/auth/invalid-link";
import { VerifyForm } from "@/components/auth/verify-form";
import { parseContact } from "@/lib/auth/contact";
import { parseRegisterRole } from "@/lib/auth/flow";
import { isDemoEnabled } from "@/lib/demo/role";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("verifyTitle") };
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function VerifyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const contact = parseContact(first(raw.contact) ?? "");
  const role = parseRegisterRole(first(raw.role));
  if (!contact || !role) return <InvalidLink />;

  const t = await getTranslations("auth");
  return (
    <>
      <AuthHeading title={t("verifyTitle")} text={t("verifyText", { contact: contact.value })} />
      <VerifyForm role={role} showDemoCode={isDemoEnabled()} />
    </>
  );
}
