import { getTranslations } from "next-intl/server";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { OpeningsManager } from "@/components/cabinet/openings-manager";
import { PageHeader } from "@/components/cabinet/page-header";
import { getCastings, getVacancies } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";

export default async function CabinetCastingsPage() {
  const [t, subject] = await Promise.all([getTranslations("cabinetPage.openings"), getDemoSubject()]);
  const org = subject.organization;
  const [castings, vacancies] = org ? await Promise.all([getCastings({ organizationId: org.id }, 1, 100), getVacancies({ organizationId: org.id }, 1, 100)]) : [null, null];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CabinetGuard subject={subject} allow={["organization"]}>
        {org && castings && vacancies && (
          <OpeningsManager orgId={org.id} castings={castings.items} vacancies={vacancies.items} />
        )}
      </CabinetGuard>
    </div>
  );
}
