import { MapPin } from "@/components/icons";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { casting as castingRoute } from "@/lib/routes";
import type { Casting } from "@/types/opportunity";
import { DeadlineLabel } from "./deadline-label";

export function CastingCard({ casting }: { casting: Casting & { organizationName?: string; applicantsCount?: number } }) {
  const t = useTranslations();
  const closed = casting.status === "closed";

  return (
    <Link href={castingRoute(casting.id)} className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
      <Card className="h-full gap-2 p-4 transition-shadow group-hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold">{casting.title}</h3>
          <StatusBadge tone={closed ? "red" : "green"}>{t(`labels.status.${casting.status}`)}</StatusBadge>
        </div>
        {casting.organizationName && <p className="truncate text-sm text-muted-foreground">{casting.organizationName}</p>}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{casting.location}</span>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          <DeadlineLabel deadline={casting.deadline} closed={closed} />
          {casting.applicantsCount !== undefined && <span className="text-xs text-muted-foreground">{t("cards.applicants", { count: casting.applicantsCount })}</span>}
        </div>
      </Card>
    </Link>
  );
}
