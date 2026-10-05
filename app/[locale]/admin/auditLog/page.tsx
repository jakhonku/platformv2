import { getTranslations } from "next-intl/server";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AuditTable } from "@/components/admin/audit-table";
import { PageHeader } from "@/components/cabinet/page-header";
import { canAccess } from "@/lib/admin-access";
import { getAuditLog, getUsers } from "@/lib/data";
import { getDemoRole } from "@/lib/demo/server";

export default async function AuditLogPage() {
  const [t, role] = await Promise.all([getTranslations("adminPage.audit"), getDemoRole()]);
  const allowed = canAccess(role, "auditLog");
  const [log, users] = allowed ? await Promise.all([getAuditLog(1, 100), getUsers({}, 1, 100)]) : [null, null];
  const actors = Object.fromEntries((users?.items ?? []).map((u) => [u.id, u.fullName]));
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGuard role={role} section="auditLog">
        {log && <AuditTable items={log.items} actors={actors} />}
      </AdminGuard>
    </div>
  );
}
