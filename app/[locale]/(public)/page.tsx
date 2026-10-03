import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CategoryGrid } from "@/components/home/category-grid";
import { CtaBanner } from "@/components/home/cta-banner";
import { EventsSection } from "@/components/home/events-section";
import { FeaturedCollectivesSection } from "@/components/home/featured-collectives";
import { FeaturedTalentsSection } from "@/components/home/featured-talents";
import { HeroSearch } from "@/components/home/hero-search";
import { NewsSection } from "@/components/home/news-section";
import { OpportunitiesSection } from "@/components/home/opportunities-section";
import { ProjectsSection } from "@/components/home/projects-section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  return {
    title: { absolute: `${t("name")} — ${t("slogan")}` },
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      title: t("name"),
      description: t("slogan"),
      siteName: t("shortName"),
      locale,
    },
  };
}

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <>
      <section className="border-b bg-muted/40">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-3 py-12 sm:px-6 sm:py-20">
          <p className="text-sm font-medium text-primary">{t("app.slogan")}</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">{t("home.heroTitle")}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{t("home.heroText")}</p>
          <HeroSearch />
          <div className="flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/register" />}>
              {t("nav.register")}
            </Button>
            <Button nativeButton={false} variant="outline" render={<Link href="/login" />}>
              {t("nav.login")}
            </Button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-14 py-12 sm:py-16">
        <CategoryGrid />
        <FeaturedTalentsSection />
        <FeaturedCollectivesSection />
        <OpportunitiesSection />
        <EventsSection />
        <ProjectsSection />
        <NewsSection />
        <CtaBanner />
      </div>
    </>
  );
}
