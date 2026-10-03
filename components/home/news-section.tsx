import { getTranslations } from "next-intl/server";
import { NewsCard } from "@/components/content/news-card";
import { CardSkeletons } from "@/components/layout/card-skeletons";
import { EmptyState } from "@/components/layout/empty-state";
import { getNews } from "@/lib/data";
import { HomeSection } from "./home-section";

const GRID3 = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

async function NewsList() {
  const [t, news] = await Promise.all([getTranslations("home"), getNews({}, 1, 3)]);
  if (news.items.length === 0) return <EmptyState title={t("emptyTitle")} text={t("emptyText")} />;
  return (
    <div className={GRID3}>
      {news.items.map((n) => (
        <NewsCard key={n.id} news={n} />
      ))}
    </div>
  );
}

export async function NewsSection() {
  const t = await getTranslations("home");
  return (
    <HomeSection
      id="news"
      title={t("newsTitle")}
      href="/news"
      hrefLabel={t("viewAll")}
      fallback={
        <div className={GRID3}>
          <CardSkeletons count={3} media />
        </div>
      }
    >
      <NewsList />
    </HomeSection>
  );
}
