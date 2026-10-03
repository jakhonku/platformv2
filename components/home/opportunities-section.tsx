import { getTranslations } from "next-intl/server";
import { CastingCard } from "@/components/casting/casting-card";
import { VacancyCard } from "@/components/casting/vacancy-card";
import { CardSkeletons } from "@/components/layout/card-skeletons";
import { EmptyState } from "@/components/layout/empty-state";
import { Link } from "@/i18n/navigation";
import { getCastings, getVacancies } from "@/lib/data";
import { HomeSection } from "./home-section";

async function OpportunitiesBody() {
  // Faqat ochiq (muddati o'tmagan) kasting va vakansiyalar — Review Focus 4
  const [t, castings, vacancies] = await Promise.all([
    getTranslations("home"),
    getCastings({ status: "open" }, 1, 4),
    getVacancies({ status: "open" }, 1, 4),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{t("castingsColumn")}</h3>
          <Link href="/castings" className="text-sm font-medium text-primary hover:underline">
            {t("viewAll")}
          </Link>
        </div>
        {castings.items.length === 0 ? (
          <EmptyState title={t("emptyTitle")} text={t("emptyText")} />
        ) : (
          castings.items.map((c) => <CastingCard key={c.id} casting={c} />)
        )}
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{t("vacanciesColumn")}</h3>
          <Link href="/vacancies" className="text-sm font-medium text-primary hover:underline">
            {t("viewAll")}
          </Link>
        </div>
        {vacancies.items.length === 0 ? (
          <EmptyState title={t("emptyTitle")} text={t("emptyText")} />
        ) : (
          vacancies.items.map((v) => <VacancyCard key={v.id} vacancy={v} />)
        )}
      </div>
    </div>
  );
}

export async function OpportunitiesSection() {
  const t = await getTranslations("home");
  return (
    <HomeSection
      id="opportunities"
      title={t("opportunitiesTitle")}
      fallback={
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <CardSkeletons count={3} />
          </div>
          <div className="flex flex-col gap-3">
            <CardSkeletons count={3} />
          </div>
        </div>
      }
    >
      <OpportunitiesBody />
    </HomeSection>
  );
}
