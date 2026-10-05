import { ArrowRight } from "@/components/icons";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function CtaBanner() {
  const t = await getTranslations();
  return (
    <section aria-labelledby="cta-title" className="mx-auto w-full max-w-7xl px-3 sm:px-6">
      <div className="glass-strong rounded-[2rem] p-8 text-center sm:p-14">

        <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
          <h2 id="cta-title" className="display text-3xl text-balance sm:text-5xl">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-balance text-foreground/65 sm:text-lg">{t("home.ctaText")}</p>
          <Button nativeButton={false} size="lg" className="group mt-2 h-12 rounded-full px-7 text-base" render={<Link href="/register" />}>
            {t("nav.register")}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </Button>
          <p className="text-sm text-foreground/60">
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t("nav.login")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
