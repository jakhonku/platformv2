"use client";

import { MessageSquare } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import type { CollectiveEvent } from "@/types/collective";
import type { LocaleCode } from "@/types/common";

/** Jamoa tadbirlari (faqat ko'rish): tadbirni platforma admini qo'shadi, jamoa murojaat orqali so'raydi */
export function EventsEditor({ events }: { collectiveId?: string; events: CollectiveEvent[] }) {
  const t = useTranslations("cabinetPage.collective");
  const locale = useLocale() as LocaleCode;
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card className="gap-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-base font-semibold">{t("eventsTitle")}</h2>
        <Button nativeButton={false} size="sm" className="rounded-full" render={<Link href="/cabinet/appeals?new=event_request" />}>
          <MessageSquare aria-hidden /> {t("requestEvent")}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{t("adminOnlyEvents")}</p>
      {sorted.length === 0 ? (
        <EmptyState title={t("noEvents")} />
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((ev) => (
            <li key={ev.id} className="rounded-xl border p-3">
              <p className="break-words text-sm font-medium">{ev.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(ev.date, locale)} · {ev.venue}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
