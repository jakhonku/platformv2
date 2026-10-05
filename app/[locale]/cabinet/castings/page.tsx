import { getLocale, getTranslations } from "next-intl/server";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { OpeningsManager } from "@/components/cabinet/openings-manager";
import { PageHeader } from "@/components/cabinet/page-header";
import { getCastings, getReferences, getVacancies } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";
import { localized } from "@/lib/localized";
import type { LocaleCode } from "@/types/common";

export default async function CabinetCastingsPage() {
  const [t, subject, locale, refs] = await Promise.all([getTranslations("cabinetPage.openings"), getDemoSubject(), getLocale() as Promise<LocaleCode>, getReferences()]);
  const org = subject.organization;
  const [castings, vacancies] = org ? await Promise.all([getCastings({ organizationId: org.id }, 1, 100), getVacancies({ organizationId: org.id }, 1, 100)]) : [null, null];
  const opt = (list: { id: string; name: Record<LocaleCode, string> }[]) => list.map((x) => ({ value: x.id, label: localized(x.name, locale) }));
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CabinetGuard subject={subject} allow={["organization"]}>
        {org && castings && vacancies && (
          <OpeningsManager orgId={org.id} castings={castings.items} vacancies={vacancies.items} options={{ regions: opt(refs.regions), instruments: opt(refs.instruments), voiceTypes: opt(refs.voiceTypes) }} />
        )}
      </CabinetGuard>
    </div>
  );
}
