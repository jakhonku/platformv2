import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/components/auth/auth-heading";
import { PhoneRegisterForm } from "@/components/auth/phone-register-form";
import { Link } from "@/i18n/navigation";
import { isDemoEnabled } from "@/lib/demo/role";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "onboarding.register" });
  return { title: t("title") };
}

export default async function RegisterPage() {
  const t = await getTranslations("onboarding.register");
  return (
    <>
      <AuthHeading title={t("title")} text={t("text")} />
      <PhoneRegisterForm showDemoCode={isDemoEnabled()} />
      <div className="mt-6 flex flex-col gap-2 border-t border-foreground/10 pt-5 text-sm text-foreground/65">
        <p>
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("login")}
          </Link>
        </p>
        <Link href="/register/entity" className="w-fit font-medium text-primary hover:underline">
          {t("entityLink")}
        </Link>
      </div>
    </>
  );
}
