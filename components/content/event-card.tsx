import { MapPin } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatDateRange, formatMoneyUzs } from "@/lib/format";
import { competition as competitionRoute, festival as festivalRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import type { Competition, EventStatus, Festival } from "@/types/content";
import { CoverImage } from "./cover-image";

const TONE: Record<EventStatus, Tone> = { upcoming: "blue", ongoing: "yellow", finished: "gray" };

type Props =
  | { kind: "competition"; event: Competition }
  | { kind: "festival"; event: Festival };

export function EventCard(props: Props) {
  const t = useTranslations();
  const locale = useLocale() as LocaleCode;
  const { event, kind } = props;
  const href = kind === "competition" ? competitionRoute(event.slug) : festivalRoute(event.slug);

  return (
    <Link href={href} className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
      <Card className="h-full gap-0 overflow-hidden p-0 transition-shadow group-hover:shadow-md">
        <CoverImage src={event.imageUrl} />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="blue">{t(`labels.eventKind.${kind}`)}</StatusBadge>
            <StatusBadge tone={TONE[event.status]}>{t(`labels.status.${event.status}`)}</StatusBadge>
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold">{event.title}</h3>
          <p className="text-xs text-muted-foreground">{formatDateRange(event.startDate, event.endDate, locale)}</p>
          <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{event.city}</span>
          </div>
          {kind === "competition" && props.event.prizeFundUzs !== undefined && (
            <p className="text-xs font-medium">{t("cards.prizeFund", { amount: formatMoneyUzs(props.event.prizeFundUzs, locale) })}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
