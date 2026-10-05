import { getLocale, getTranslations } from "next-intl/server";
import { AdminGuard } from "@/components/admin/admin-guard";
import { EventsAdmin } from "@/components/admin/events-admin";
import { PageHeader } from "@/components/cabinet/page-header";
import { canAccess } from "@/lib/admin-access";
import { getCompetitions, getFestivals, getReferences } from "@/lib/data";
import { getActorId, getDemoRole } from "@/lib/demo/server";
import { localized } from "@/lib/localized";
import type { LocaleCode } from "@/types/common";

export default async function AdminEventsPage() {
  const [t, role, actorId, locale] = await Promise.all([getTranslations("adminPage.events"), getDemoRole(), getActorId(), getLocale() as Promise<LocaleCode>]);
  const allowed = canAccess(role, "competitions");
  const [competitions, festivals, refs] = allowed ? await Promise.all([getCompetitions({}, 1, 100), getFestivals({}, 1, 100), getReferences()]) : [null, null, null];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGuard role={role} section="competitions">
        {competitions && festivals && refs && (
          <EventsAdmin
            competitions={competitions.items}
            festivals={festivals.items}
            regions={refs.regions.map((r) => ({ value: r.id, label: localized(r.name, locale) }))}
            categories={refs.categories.filter((c) => c.kind === "event").map((c) => ({ value: c.id, label: localized(c.name, locale) }))}
            actorId={actorId}
          />
        )}
      </AdminGuard>
    </div>
  );
}
