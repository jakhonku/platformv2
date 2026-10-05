import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Role } from "@/lib/demo/role";
import type { DemoSubject } from "@/lib/demo/subject";

/**
 * Rol ruxsatini tekshiradi: mehmon — «Kirish» CTA, ruxsatsiz rol — tushunarli holat.
 * Subyekt topilmasa (mock bo'sh) ham xuddi shunday ruxsatsiz holat ko'rsatiladi.
 */
export async function CabinetGuard({ subject, allow, children }: { subject: DemoSubject; allow: readonly Role[]; children: React.ReactNode }) {
  const t = await getTranslations("cabinetPage.guard");
  if (subject.role === "guest") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-full">
          <EmptyState title={t("guestTitle")} text={t("guestText")} />
        </div>
        <Button nativeButton={false} render={<Link href="/login" />}>
          {t("login")}
        </Button>
      </div>
    );
  }
  if (!allow.includes(subject.role)) {
    const staff = subject.role === "admin" || subject.role === "moderator";
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-full">
          <EmptyState title={t("forbiddenTitle")} text={t("forbiddenText")} />
        </div>
        <Button nativeButton={false} variant="outline" render={<Link href={staff ? "/admin" : "/cabinet"} />}>
          {staff ? t("toAdmin") : t("toCabinet")}
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}
