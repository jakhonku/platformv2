import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("loginTitle") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">{t("loginTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("loginText")}</p>
    </div>
  );
}
