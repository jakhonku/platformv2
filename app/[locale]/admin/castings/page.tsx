import { getTranslations } from "next-intl/server";
import { AdminGuard } from "@/components/admin/admin-guard";
import { OpeningsAdmin, type OpeningRow } from "@/components/admin/openings-admin";
import { PageHeader } from "@/components/cabinet/page-header";
import { canAccess } from "@/lib/admin-access";
import { getCastings, getVacancies } from "@/lib/data";
import { getActorId, getDemoRole } from "@/lib/demo/server";

export default async function AdminCastingsPage() {
  const [t, role, actorId] = await Promise.all([getTranslations("adminPage.openings"), getDemoRole(), getActorId()]);
  const [castings, vacancies] = canAccess(role, "castings") ? await Promise.all([getCastings({}, 1, 100), getVacancies({}, 1, 100)]) : [null, null];
  const rows: OpeningRow[] = [
    ...(castings?.items ?? []).map((c) => ({ key: `casting-${c.id}`, kind: "casting" as const, id: c.id, title: c.title, organizationName: c.organizationName, status: c.status, deadline: c.deadline, applicantsCount: c.applicantsCount })),
    ...(vacancies?.items ?? []).map((v) => ({ key: `vacancy-${v.id}`, kind: "vacancy" as const, id: v.id, title: v.title, organizationName: v.organizationName, status: v.status, deadline: v.deadline, applicantsCount: v.applicantsCount })),
  ];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("pageTitle")} description={t("description")} />
      <AdminGuard role={role} section="castings">
        <OpeningsAdmin rows={rows} actorId={actorId} />
      </AdminGuard>
    </div>
  );
}
