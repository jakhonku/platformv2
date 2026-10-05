import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { canAccess, type AdminSection } from "@/lib/admin-access";
import type { Role } from "@/lib/demo/role";

/** Bo`lim ruxsatini tekshiradi (moderator uchun cheklangan); ruxsat yo`q bo`lsa tushunarli holat */
export async function AdminGuard({ role, section, children }: { role: Role; section: AdminSection; children: React.ReactNode }) {
  if (canAccess(role, section)) return <>{children}</>;
  const t = await getTranslations("adminPage.guard");
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full">
        <EmptyState title={t("title")} text={t("text")} />
      </div>
      <Button nativeButton={false} variant="outline" render={<Link href="/admin" />}>
        {t("back")}
      </Button>
    </div>
  );
}
