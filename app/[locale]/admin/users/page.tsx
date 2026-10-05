import { getTranslations } from "next-intl/server";
import { AdminGuard } from "@/components/admin/admin-guard";
import { UsersTable } from "@/components/admin/users-table";
import { PageHeader } from "@/components/cabinet/page-header";
import { getUsers } from "@/lib/data";
import { getActorId, getDemoRole } from "@/lib/demo/server";

export default async function UsersPage() {
  const [t, role, actorId] = await Promise.all([getTranslations("adminPage.users"), getDemoRole(), getActorId()]);
  const users = role === "admin" ? (await getUsers({}, 1, 100)).items : [];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGuard role={role} section="users">
        <UsersTable users={users} actorId={actorId} />
      </AdminGuard>
    </div>
  );
}
