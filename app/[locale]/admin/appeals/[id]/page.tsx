import { ArrowLeft } from "@/components/icons";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminGuard } from "@/components/admin/admin-guard";
import { LetterActionsAdmin } from "@/components/appeals/letter-actions-admin";
import { LetterView } from "@/components/appeals/letter-view";
import { PageHeader } from "@/components/cabinet/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { canAccess } from "@/lib/admin-access";
import { getAppealById } from "@/lib/data";
import { getActorId, getDemoRole } from "@/lib/demo/server";

export default async function AdminLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, t, role, actorId] = await Promise.all([params, getTranslations("appeals.letter"), getDemoRole(), getActorId()]);
  const appeal = canAccess(role, "appeals") ? await getAppealById(id) : null;
  if (canAccess(role, "appeals") && !appeal) notFound();
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        title={appeal ? `№ ${appeal.number}` : t("number")}
        actions={
          <Button nativeButton={false} variant="outline" className="print:hidden" render={<Link href="/admin/appeals" />}>
            <ArrowLeft aria-hidden /> {t("back")}
          </Button>
        }
      />
      <AdminGuard role={role} section="appeals">
        {appeal && (
          <>
            <LetterView appeal={appeal} viewer="admin" />
            <LetterActionsAdmin key={`${appeal.id}-${appeal.updatedAt}`} appeal={appeal} actorId={actorId} />
          </>
        )}
      </AdminGuard>
    </div>
  );
}
