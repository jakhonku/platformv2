import { getTranslations } from "next-intl/server";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { NotificationSettings } from "@/components/cabinet/notification-settings";
import { PageHeader } from "@/components/cabinet/page-header";
import { getNotificationSettings } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";

const ROLES = ["musician", "vocalist", "conductor", "composer", "collective", "organization"] as const;

export default async function SettingsPage() {
  const [t, subject] = await Promise.all([getTranslations("cabinetPage.settings"), getDemoSubject()]);
  const key = subject.userId ?? subject.collective?.id ?? "";
  const initial = key ? await getNotificationSettings(key) : null;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CabinetGuard subject={subject} allow={ROLES}>
        {initial && <NotificationSettings key={key} settingsKey={key} initial={initial} />}
      </CabinetGuard>
    </div>
  );
}
