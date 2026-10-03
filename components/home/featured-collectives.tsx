import { getTranslations } from "next-intl/server";
import { CollectiveCard } from "@/components/collective/collective-card";
import { CardSkeletons } from "@/components/layout/card-skeletons";
import { EmptyState } from "@/components/layout/empty-state";
import { getCollectives } from "@/lib/data";
import { GRID, HomeSection } from "./home-section";

async function FeaturedCollectivesList() {
  const [t, collectives] = await Promise.all([
    getTranslations("home"),
    getCollectives({ verified: true, sort: "members" }, 1, 4),
  ]);
  if (collectives.items.length === 0) return <EmptyState title={t("emptyTitle")} text={t("emptyText")} />;
  return (
    <div className={GRID}>
      {collectives.items.map((c) => (
        <CollectiveCard key={c.id} collective={c} />
      ))}
    </div>
  );
}

export async function FeaturedCollectivesSection() {
  const t = await getTranslations("home");
  return (
    <HomeSection
      id="featured-collectives"
      title={t("featuredCollectivesTitle")}
      href="/orchestras"
      hrefLabel={t("viewAll")}
      fallback={
        <div className={GRID}>
          <CardSkeletons count={4} />
        </div>
      }
    >
      <FeaturedCollectivesList />
    </HomeSection>
  );
}
