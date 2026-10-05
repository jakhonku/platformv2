import { CalendarDays, MapPin } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { EmptyState } from "@/components/layout/empty-state";
import { formatDate } from "@/lib/format";
import type { CollectiveEvent } from "@/types/collective";
import type { LocaleCode } from "@/types/common";

export function EventsList({ events }: { events: CollectiveEvent[] }) {
  const t = useTranslations("collectivePage");
  const locale = useLocale() as LocaleCode;
  if (events.length === 0) return <EmptyState title={t("noEvents")} />;

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <ul className="flex flex-col divide-y rounded-xl border bg-card">
      {sorted.map((e) => (
        <li key={e.id} className="flex flex-col gap-1 px-4 py-3">
          <span className="break-words text-sm font-medium">{e.title}</span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 shrink-0" aria-hidden />
              {formatDate(e.date, locale)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {e.venue}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
