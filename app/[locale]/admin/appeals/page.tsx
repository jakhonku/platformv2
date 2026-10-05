import { getTranslations } from "next-intl/server";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AppealsAdmin } from "@/components/appeals/appeals-admin";
import { PageHeader } from "@/components/cabinet/page-header";
import { canAccess } from "@/lib/admin-access";
import { getAppeals } from "@/lib/data";
import { getDemoRole } from "@/lib/demo/server";

export default async function AdminAppealsPage() {
  const [t, role] = await Promise.all([getTranslations("appeals.admin"), getDemoRole()]);
  const appeals = canAccess(role, "appeals") ? await getAppeals() : [];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGuard role={role} section="appeals">
        <AppealsAdmin appeals={appeals} />
      </AdminGuard>
    </div>
  );
}
