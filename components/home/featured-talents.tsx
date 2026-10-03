import { getTranslations } from "next-intl/server";
import { CardSkeletons } from "@/components/layout/card-skeletons";
import { EmptyState } from "@/components/layout/empty-state";
import { TalentCard } from "@/components/talent/talent-card";
import { getCollectives, getFeaturedTalents } from "@/lib/data";
import { GRID, HomeSection } from "./home-section";

async function FeaturedTalentsList() {
  const [t, talents, collectives] = await Promise.all([
    getTranslations("home"),
    getFeaturedTalents(8),
    getCollectives({}, 1, 100),
  ]);
  if (talents.length === 0) return <EmptyState title={t("emptyTitle")} text={t("emptyText")} />;

  const names = new Map(collectives.items.map((c) => [c.id, c.name]));
  return (
    <div className={GRID}>
      {talents.map((talent) => (
        <TalentCard
          key={talent.id}
          talent={talent}
          collectiveName={talent.currentCollectiveId ? names.get(talent.currentCollectiveId) : undefined}
        />
      ))}
    </div>
  );
}

export async function FeaturedTalentsSection() {
  const t = await getTranslations("home");
  return (
    <HomeSection
      id="featured-talents"
      title={t("featuredTalentsTitle")}
      href="/musicians"
      hrefLabel={t("viewAll")}
      fallback={
        <div className={GRID}>
          <CardSkeletons count={8} />
        </div>
      }
    >
      <FeaturedTalentsList />
    </HomeSection>
  );
}
