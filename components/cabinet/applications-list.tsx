import { useLocale, useTranslations } from "next-intl";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { ApplicationView } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { casting as castingRoute, vacancy as vacancyRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import { ApplicationStatusBadge } from "./application-status";

export function ApplicationsList({ items }: { items: ApplicationView[] }) {
  const t = useTranslations("cabinetPage.applications");
  const ts = useTranslations("cabinetPage.status");
  const locale = useLocale() as LocaleCode;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-full">
          <EmptyState title={t("emptyTitle")} text={t("emptyText")} />
        </div>
        <Button nativeButton={false} render={<Link href="/castings" />}>
          {t("browse")}
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((a) => (
        <li key={a.id}>
          <Card className="gap-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={a.targetKind === "casting" ? castingRoute(a.castingId!) : vacancyRoute(a.vacancyId!)}
                  className="break-words text-sm font-semibold hover:underline"
                >
                  {a.title}
                </Link>
                <p className="truncate text-sm text-muted-foreground">
                  {a.organizationName} · {t(`kind.${a.targetKind}`)}
                </p>
              </div>
              <ApplicationStatusBadge status={a.status} />
            </div>
            <ol className="flex flex-col gap-1 border-l pl-3 text-xs text-muted-foreground" aria-label={t("history")}>
              {a.history.map((h, i) => (
                <li key={`${h.status}-${i}`} className="flex flex-wrap gap-x-2">
                  <span className="font-medium text-foreground">{ts(h.status)}</span>
                  <span>{formatDate(h.at, locale)}</span>
                  {h.note && <span>— {h.note}</span>}
                </li>
              ))}
            </ol>
          </Card>
        </li>
      ))}
    </ul>
  );
}
