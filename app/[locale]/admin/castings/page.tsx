import { getLocale, getTranslations } from "next-intl/server";
import { AdminGuard } from "@/components/admin/admin-guard";
import { OpeningsAdmin, type OpeningRow } from "@/components/admin/openings-admin";
import { PageHeader } from "@/components/cabinet/page-header";
import { canAccess } from "@/lib/admin-access";
import { getCastings, getOrganizations, getReferences, getVacancies } from "@/lib/data";
import { localized } from "@/lib/localized";
import type { LocaleCode } from "@/types/common";
import { getActorId, getDemoRole } from "@/lib/demo/server";

export default async function AdminCastingsPage() {
  const [t, role, actorId, locale] = await Promise.all([getTranslations("adminPage.openings"), getDemoRole(), getActorId(), getLocale() as Promise<LocaleCode>]);
  const allowed = canAccess(role, "castings");
  const [castings, vacancies] = allowed ? await Promise.all([getCastings({}, 1, 100), getVacancies({}, 1, 100)]) : [null, null];
  const [orgs, refs] = allowed ? await Promise.all([getOrganizations({}, 1, 200), getReferences()]) : [null, null];
  const opt = (list: { id: string; name: Record<LocaleCode, string> }[]) => list.map((x) => ({ value: x.id, label: localized(x.name, locale) }));
  const rows: OpeningRow[] = [
    ...(castings?.items ?? []).map((c) => ({ key: `casting-${c.id}`, kind: "casting" as const, id: c.id, title: c.title, organizationName: c.organizationName, status: c.status, deadline: c.deadline, applicantsCount: c.applicantsCount })),
    ...(vacancies?.items ?? []).map((v) => ({ key: `vacancy-${v.id}`, kind: "vacancy" as const, id: v.id, title: v.title, organizationName: v.organizationName, status: v.status, deadline: v.deadline, applicantsCount: v.applicantsCount })),
  ];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("pageTitle")} description={t("description")} />
      <AdminGuard role={role} section="castings">
        {role === "admin" && orgs && refs ? (
          <OpeningsAdmin rows={rows} actorId={actorId} organizations={orgs.items.map((o) => ({ value: o.id, label: o.name }))} options={{ regions: opt(refs.regions), instruments: opt(refs.instruments), voiceTypes: opt(refs.voiceTypes) }} />
        ) : (
          <OpeningsAdmin rows={rows} actorId={actorId} organizations={[]} options={{ regions: [], instruments: [], voiceTypes: [] }} />
        )}
      </AdminGuard>
    </div>
  );
}
