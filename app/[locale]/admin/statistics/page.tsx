import { getLocale, getTranslations } from "next-intl/server";
import { AdminGuard } from "@/components/admin/admin-guard";
import { StatisticsCharts, type StatisticsData } from "@/components/admin/statistics-charts";
import { PageHeader } from "@/components/cabinet/page-header";
import { canAccess } from "@/lib/admin-access";
import { instrumentById, regionById, voiceTypeById } from "@/lib/constants";
import { getAdminStatistics } from "@/lib/data";
import { getDemoRole } from "@/lib/demo/server";
import { localized } from "@/lib/localized";
import type { LocaleCode } from "@/types/common";

export default async function StatisticsPage() {
  const [t, tk, ts, ta, tag, tex, tct, tok, tap, role, locale] = await Promise.all([
    getTranslations("adminPage.statistics"),
    getTranslations("labels.talentKind"),
    getTranslations("cabinetPage.status"),
    getTranslations("labels.availability"),
    getTranslations("adminPage.statistics.age"),
    getTranslations("adminPage.statistics.experience"),
    getTranslations("labels.collectiveType"),
    getTranslations("catalog.orgKind"),
    getTranslations("appeals.status"),
    getDemoRole(),
    getLocale() as Promise<LocaleCode>,
  ]);
  const s = canAccess(role, "statistics") ? await getAdminStatistics() : null;

  const data: StatisticsData | null = s && {
    kpis: [
      { label: t("kpi.talents"), value: String(s.talentsByKind.reduce((n, x) => n + x.count, 0)) },
      { label: t("kpi.averageAge"), value: s.averages.age === null ? "—" : String(s.averages.age), hint: t("kpi.years") },
      { label: t("kpi.averageExperience"), value: String(s.averages.experience), hint: t("kpi.years") },
      { label: t("kpi.verified"), value: `${Math.round((s.accounts.verified / Math.max(1, s.accounts.verified + s.accounts.unverified)) * 100)}%`, hint: t("kpi.verifiedHint", { count: s.accounts.verified }) },
    ],
    kinds: s.talentsByKind.map((x) => ({ label: tk(x.kind), value: x.count })),
    availability: s.talentsByAvailability.map((x) => ({ label: ta(x.availability), value: x.count })),
    accounts: [
      { label: t("verifiedAccounts"), value: s.accounts.verified },
      { label: t("unverifiedAccounts"), value: s.accounts.unverified },
    ],
    ages: s.talentsByAge.map((x) => ({ label: tag(x.group), value: x.count })),
    experience: s.talentsByExperience.map((x) => ({ label: tex(x.group), value: x.count })),
    instruments: s.talentsByInstrument.map((x) => ({ label: instrumentById(x.instrumentId) ? localized(instrumentById(x.instrumentId)!.name, locale) : x.instrumentId, value: x.count })),
    voices: s.talentsByVoice.map((x) => ({ label: voiceTypeById(x.voiceTypeId) ? localized(voiceTypeById(x.voiceTypeId)!.name, locale) : x.voiceTypeId, value: x.count })),
    regions: s.topRegions.map((x) => ({ label: regionById(x.regionId) ? localized(regionById(x.regionId)!.name, locale) : x.regionId, value: x.count })),
    collectives: s.collectivesByType.map((x) => ({ label: tct(x.type), value: x.count })),
    organizations: s.organizationsByKind.map((x) => ({ label: tok(x.kind), value: x.count })),
    openings: [
      { label: t("castingsOpen"), value: s.openings.castingsOpen },
      { label: t("castingsClosed"), value: s.openings.castingsClosed },
      { label: t("vacanciesOpen"), value: s.openings.vacanciesOpen },
      { label: t("vacanciesClosed"), value: s.openings.vacanciesClosed },
    ],
    statuses: s.applicationsByStatus.map((x) => ({ label: ts(x.status), value: x.count })),
    appeals: s.appealsByStatus.map((x) => ({ label: tap(x.status), value: x.count })),
    monthly: s.monthlyViews,
    weekly: s.weeklyViews,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGuard role={role} section="statistics">
        {data && <StatisticsCharts data={data} />}
      </AdminGuard>
    </div>
  );
}
