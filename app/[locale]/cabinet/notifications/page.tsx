import { getTranslations } from "next-intl/server";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { NotificationsList } from "@/components/cabinet/notifications-list";
import { PageHeader } from "@/components/cabinet/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { getNotifications } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";

const ROLES = ["member", "musician", "vocalist", "conductor", "composer", "collective", "organization"] as const;

export default async function NotificationsPage() {
  const [t, subject] = await Promise.all([getTranslations("cabinetPage.notifications"), getDemoSubject()]);
  const items = subject.userId ? await getNotifications(subject.userId) : [];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CabinetGuard subject={subject} allow={ROLES}>
        {subject.userId ? <NotificationsList items={items} userId={subject.userId} /> : <EmptyState title={t("emptyTitle")} text={t("emptyText")} />}
      </CabinetGuard>
    </div>
  );
}
