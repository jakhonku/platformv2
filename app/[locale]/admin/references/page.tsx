import { getTranslations } from "next-intl/server";
import { AdminGuard } from "@/components/admin/admin-guard";
import { ReferencesAdmin } from "@/components/admin/references-admin";
import { PageHeader } from "@/components/cabinet/page-header";
import { canAccess } from "@/lib/admin-access";
import { getReferences } from "@/lib/data";
import { getActorId, getDemoRole } from "@/lib/demo/server";

export default async function ReferencesPage() {
  const [t, role, actorId] = await Promise.all([getTranslations("adminPage.references"), getDemoRole(), getActorId()]);
  const refs = canAccess(role, "references") ? await getReferences() : null;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGuard role={role} section="references">
        {refs && <ReferencesAdmin instruments={refs.instruments} voiceTypes={refs.voiceTypes} regions={refs.regions} categories={refs.categories} actorId={actorId} />}
      </AdminGuard>
    </div>
  );
}
