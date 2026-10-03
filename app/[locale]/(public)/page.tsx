import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-3 py-16 sm:px-6 sm:py-24">
      <p className="text-sm font-medium text-primary">{t("app.slogan")}</p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">{t("home.heroTitle")}</h1>
      <p className="max-w-2xl text-lg text-muted-foreground">{t("home.heroText")}</p>
      <div className="flex flex-wrap gap-3">
        <Button nativeButton={false} render={<Link href="/register" />}>
          {t("nav.register")}
        </Button>
        <Button nativeButton={false} variant="outline" render={<Link href="/login" />}>
          {t("nav.login")}
        </Button>
      </div>
    </section>
  );
}
