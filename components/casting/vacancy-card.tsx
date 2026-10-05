import { MapPin, Wallet } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { formatMoneyUzs } from "@/lib/format";
import { vacancy as vacancyRoute } from "@/lib/routes";
import type { Vacancy } from "@/types/opportunity";
import type { LocaleCode } from "@/types/common";
import { DeadlineLabel } from "./deadline-label";

export function VacancyCard({ vacancy }: { vacancy: Vacancy & { organizationName?: string; applicantsCount?: number } }) {
  const t = useTranslations();
  const locale = useLocale() as LocaleCode;
  const closed = vacancy.status === "closed";
  const hasSalary = vacancy.salaryFromUzs !== undefined && vacancy.salaryToUzs !== undefined;

  return (
    <Link href={vacancyRoute(vacancy.id)} className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
      <Card className="h-full gap-2 p-4 transition-shadow group-hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold">{vacancy.title}</h3>
          <StatusBadge tone={closed ? "red" : "green"}>{t(`labels.status.${vacancy.status}`)}</StatusBadge>
        </div>
        {vacancy.organizationName && <p className="truncate text-sm text-muted-foreground">{vacancy.organizationName}</p>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {vacancy.city}
          </span>
          <span>{t(`labels.employment.${vacancy.employment}`)}</span>
        </div>
        {hasSalary && (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wallet className="size-3.5 shrink-0" aria-hidden />
            {t("cards.salary", {
              from: formatMoneyUzs(vacancy.salaryFromUzs!, locale),
              to: formatMoneyUzs(vacancy.salaryToUzs!, locale),
            })}
          </p>
        )}
        <div className="mt-auto pt-1">
          <DeadlineLabel deadline={vacancy.deadline} closed={closed} />
        </div>
      </Card>
    </Link>
  );
}
