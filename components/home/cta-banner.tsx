import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function CtaBanner() {
  const t = await getTranslations();
  return (
    <section aria-labelledby="cta-title" className="mx-auto w-full max-w-7xl px-3 sm:px-6">
      <div className="flex flex-col items-start gap-4 rounded-2xl border bg-muted/50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="max-w-xl">
          <h2 id="cta-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t("home.ctaTitle")}
          </h2>
          <p className="mt-1 text-muted-foreground">{t("home.ctaText")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button nativeButton={false} size="lg" render={<Link href="/login" />}>
            {t("nav.login")}
          </Button>
        </div>
      </div>
    </section>
  );
}
