import { getTranslations } from "next-intl/server";
import { AdminGuard } from "@/components/admin/admin-guard";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { PageHeader } from "@/components/cabinet/page-header";
import { canAccess } from "@/lib/admin-access";
import { getModerationQueue } from "@/lib/data";
import { getActorId, getDemoRole } from "@/lib/demo/server";

export default async function ModerationPage() {
  const [t, role, actorId] = await Promise.all([getTranslations("adminPage.moderation"), getDemoRole(), getActorId()]);
  const items = canAccess(role, "media") ? await getModerationQueue("media") : [];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title.media")} description={t("description.media")} />
      <AdminGuard role={role} section="media">
        <ModerationQueue kind="media" items={items} actorId={actorId} />
      </AdminGuard>
    </div>
  );
}
