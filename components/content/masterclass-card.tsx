import { CalendarDays, Clock, UserRound } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatDate, formatMoneyUzs } from "@/lib/format";
import { masterClass as masterClassRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import type { MasterClass } from "@/types/content";
import { CoverImage } from "./cover-image";

export function MasterClassCard({ masterClass, teacherName }: { masterClass: MasterClass; teacherName?: string }) {
  const t = useTranslations("educationPage");
  const tf = useTranslations("listing.format");
  const locale = useLocale() as LocaleCode;

  return (
    <Link href={masterClassRoute(masterClass.slug)} className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
      <Card className="h-full gap-0 overflow-hidden p-0 transition-shadow group-hover:shadow-md">
        <CoverImage src={masterClass.imageUrl} />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="blue">{tf(masterClass.format)}</StatusBadge>
            <StatusBadge tone={masterClass.seats > 0 ? "green" : "red"}>
              {masterClass.seats > 0 ? t("seatsLeft", { count: masterClass.seats }) : t("noSeats")}
            </StatusBadge>
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold">{masterClass.title}</h3>
          {teacherName && (
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <UserRound className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{teacherName}</span>
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 shrink-0" aria-hidden />
              {formatDate(masterClass.date, locale)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0" aria-hidden />
              {t("hours", { count: masterClass.durationHours })}
            </span>
            <span className="font-medium text-foreground">{masterClass.priceUzs > 0 ? formatMoneyUzs(masterClass.priceUzs, locale) : t("free")}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
