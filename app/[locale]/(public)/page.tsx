import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CategoryGrid } from "@/components/home/category-grid";
import { CtaBanner } from "@/components/home/cta-banner";
import { EventsSection } from "@/components/home/events-section";
import { FeaturedCollectivesSection } from "@/components/home/featured-collectives";
import { FeaturedTalentsSection } from "@/components/home/featured-talents";
import { HeroSearch } from "@/components/home/hero-search";
import { Reveal } from "@/components/home/reveal";
import { SectionBoundary } from "@/components/home/section-boundary";
import { HeroBackground } from "@/components/home/hero-background";
import { StatsStrip } from "@/components/home/stats-strip";
import { NewsSection } from "@/components/home/news-section";
import { OpportunitiesSection } from "@/components/home/opportunities-section";
import { ProjectsSection } from "@/components/home/projects-section";
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
      {/* Rasm foni: header ostiga cho'ziladi (header balandligi 68px) */}
      <section className="relative isolate -mt-[68px] overflow-hidden">
        <HeroBackground />
        <div className="hero-in relative mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-7xl flex-col items-start justify-end gap-6 px-4 pt-32 pb-28 text-left sm:px-6 sm:pb-32">
          <h1 style={{ "--i": 0 } as React.CSSProperties} className="max-w-3xl text-balance text-5xl text-foreground sm:text-7xl sm:leading-[1.06]">
            {t("home.heroTitle")}
          </h1>
          <p style={{ "--i": 1 } as React.CSSProperties} className="max-w-xl text-balance text-lg text-foreground/75 sm:text-xl">
            {t("home.heroText")}
          </p>
          <div style={{ "--i": 2 } as React.CSSProperties} className="flex w-full justify-start">
            <HeroSearch />
          </div>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-(--page-bg) to-transparent" />
      </section>

      <div className="flex flex-col gap-16 pb-16 sm:gap-24 sm:pb-24">
        <Reveal>
          <SectionBoundary fallback={null}>
            <StatsStrip />
          </SectionBoundary>
        </Reveal>
        <Reveal>
          <CategoryGrid />
        </Reveal>
        <Reveal>
          <FeaturedTalentsSection />
        </Reveal>
        <Reveal>
          <FeaturedCollectivesSection />
        </Reveal>
        <Reveal>
          <OpportunitiesSection />
        </Reveal>
        <Reveal>
          <EventsSection />
        </Reveal>
        <Reveal>
          <ProjectsSection />
        </Reveal>
        <Reveal>
          <NewsSection />
        </Reveal>
        <Reveal>
          <CtaBanner />
        </Reveal>
      </div>
    </>
  );
}
