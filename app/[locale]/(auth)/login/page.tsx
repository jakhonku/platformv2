import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/components/auth/auth-heading";
import { PhoneLoginForm } from "@/components/auth/phone-login-form";
import { RolePicker } from "@/components/auth/role-picker";
import { Link } from "@/i18n/navigation";
import { isDemoEnabled } from "@/lib/demo/role";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "onboarding.login" });
  return { title: t("title") };
}

export default async function LoginPage() {
  const t = await getTranslations("onboarding.login");
  const demo = isDemoEnabled();
  return (
    <>
      <AuthHeading title={t("title")} text={t("text")} />
      <PhoneLoginForm showDemoCode={demo} />
      <p className="mt-5 text-sm text-foreground/65">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t("register")}
        </Link>
      </p>
      {demo && (
        <div className="mt-7 flex flex-col gap-3 border-t border-foreground/10 pt-6">
          <div>
            <h2 className="text-sm font-semibold">{t("demoTitle")}</h2>
            <p className="text-xs text-foreground/60">{t("demoText")}</p>
          </div>
          <RolePicker />
        </div>
      )}
    </>
  );
}
