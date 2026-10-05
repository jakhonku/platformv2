import { getTranslations } from "next-intl/server";
import { AdminGuard } from "@/components/admin/admin-guard";
import { SystemPanel } from "@/components/admin/system-panel";
import { PageHeader } from "@/components/cabinet/page-header";
import { canAccess } from "@/lib/admin-access";
import { getSystemInfo, getSystemSettings } from "@/lib/data";
import { getActorId, getDemoRole } from "@/lib/demo/server";

export default async function SystemPage() {
  const [t, role, actorId] = await Promise.all([getTranslations("adminPage.system"), getDemoRole(), getActorId()]);
  const [info, settings] = canAccess(role, "system") ? await Promise.all([getSystemInfo(), getSystemSettings()]) : [null, null];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGuard role={role} section="system">
        {info && settings && <SystemPanel info={info} settings={settings} actorId={actorId} />}
      </AdminGuard>
    </div>
  );
}
