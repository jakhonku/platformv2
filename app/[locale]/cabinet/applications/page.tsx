import { getTranslations } from "next-intl/server";
import { ApplicationsList } from "@/components/cabinet/applications-list";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { PageHeader } from "@/components/cabinet/page-header";
import { getMyApplications } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";

const ROLES = ["musician", "vocalist", "conductor", "composer"] as const;

export default async function ApplicationsPage() {
  const [t, subject] = await Promise.all([getTranslations("cabinetPage.applications"), getDemoSubject()]);
  const items = subject.talent ? await getMyApplications(subject.talent.id) : [];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CabinetGuard subject={subject} allow={ROLES}>
        <ApplicationsList items={items} />
      </CabinetGuard>
    </div>
  );
}
