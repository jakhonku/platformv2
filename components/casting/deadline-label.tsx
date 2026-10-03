import { CalendarClock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { daysLeft, formatDate } from "@/lib/format";
import type { LocaleCode } from "@/types/common";

export function DeadlineLabel({ deadline, closed }: { deadline: string; closed: boolean }) {
  const t = useTranslations("cards");
  const locale = useLocale() as LocaleCode;
  const left = daysLeft(deadline, new Date().toISOString());

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <CalendarClock className="size-3.5 shrink-0" aria-hidden />
      <span>{t("deadline", { date: formatDate(deadline, locale) })}</span>
      {!closed && <span className="font-medium text-foreground">· {left > 0 ? t("daysLeft", { count: left }) : t("deadlineToday")}</span>}
    </span>
  );
}
