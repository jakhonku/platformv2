import { Eye } from "@/components/icons";
import { getTranslations } from "next-intl/server";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { PageHeader } from "@/components/cabinet/page-header";
import { StatCard } from "@/components/cabinet/stat-card";
import { StatsChart } from "@/components/cabinet/stats-chart";
import { EmptyState } from "@/components/layout/empty-state";
import { Card } from "@/components/ui/card";
import { getPortfolioStats } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";

const ROLES = ["musician", "vocalist", "conductor", "composer", "collective"] as const;

export default async function StatsPage() {
  const [t, subject] = await Promise.all([getTranslations("cabinetPage.stats"), getDemoSubject()]);
  const ownerId = subject.talent?.id ?? subject.collective?.id;
  const stats = ownerId ? await getPortfolioStats(ownerId) : null;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CabinetGuard subject={subject} allow={ROLES}>
        {!stats || stats.totalViews === 0 ? (
          <EmptyState title={t("emptyTitle")} text={t("emptyText")} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label={t("totalViews")} value={stats.totalViews} icon={Eye} />
              <StatCard label={t("items")} value={stats.items.length} icon={Eye} />
            </div>
            <StatsChart monthly={stats.monthly} />
            <Card className="gap-3 p-4">
              <h2 className="text-base font-semibold">{t("topItems")}</h2>
              <ol className="flex flex-col gap-2">
                {stats.items.slice(0, 5).map((i, n) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">
                      {n + 1}. {i.title}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{i.views}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </>
        )}
      </CabinetGuard>
    </div>
  );
}
