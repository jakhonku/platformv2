import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/cabinet/page-header";
import { canAccess, type AdminSection } from "@/lib/admin-access";
import { getModerationList, getUsers, type ModerationKind } from "@/lib/data";
import { getActorId, getDemoRole } from "@/lib/demo/server";
import { AdminGuard } from "./admin-guard";
import { ApplicationReview } from "./application-review";

/** Moderatsiya sahifalari (profil, media, tashkilot, jamoa) uchun umumiy server karkas */
export async function ModerationPage({ kind, section }: { kind: ModerationKind; section: AdminSection }) {
  const [t, role, actorId] = await Promise.all([getTranslations("adminPage.moderation"), getDemoRole(), getActorId()]);
  const allowed = canAccess(role, section);
  const [items, admins, moderators] = allowed ? await Promise.all([getModerationList(kind), getUsers({ role: "admin" }, 1, 20), getUsers({ role: "moderator" }, 1, 20)]) : [[], null, null];
  const actors = Object.fromEntries([...(admins?.items ?? []), ...(moderators?.items ?? [])].map((u) => [u.id, u.fullName]));
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t(`title.${section}`)} description={t(`description.${section}`)} />
      <AdminGuard role={role} section={section}>
        <ApplicationReview kind={kind} items={items} actorId={actorId} actors={actors} />
      </AdminGuard>
    </div>
  );
}
