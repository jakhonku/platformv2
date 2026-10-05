import { getLocale, getTranslations } from "next-intl/server";
import { AdminGuard } from "@/components/admin/admin-guard";
import { StatisticsCharts } from "@/components/admin/statistics-charts";
import { PageHeader } from "@/components/cabinet/page-header";
import { canAccess } from "@/lib/admin-access";
import { regionById } from "@/lib/constants";
import { getAdminStatistics } from "@/lib/data";
import { getDemoRole } from "@/lib/demo/server";
import { localized } from "@/lib/localized";
import type { LocaleCode } from "@/types/common";

export default async function StatisticsPage() {
  const [t, tk, ts, role, locale] = await Promise.all([getTranslations("adminPage.statistics"), getTranslations("labels.talentKind"), getTranslations("cabinetPage.status"), getDemoRole(), getLocale() as Promise<LocaleCode>]);
  const stats = canAccess(role, "statistics") ? await getAdminStatistics() : null;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGuard role={role} section="statistics">
        {stats && (
          <StatisticsCharts
            kinds={stats.talentsByKind.map((x) => ({ label: tk(x.kind), value: x.count }))}
            statuses={stats.applicationsByStatus.map((x) => ({ label: ts(x.status), value: x.count }))}
            regions={stats.topRegions.map((x) => ({ label: regionById(x.regionId) ? localized(regionById(x.regionId)!.name, locale) : x.regionId, value: x.count }))}
            monthly={stats.monthlyViews}
          />
        )}
      </AdminGuard>
    </div>
  );
}
