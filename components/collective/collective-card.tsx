import Image from "next/image";
import { MapPin } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { VerifiedBadge } from "@/components/talent/verified-badge";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { regionById } from "@/lib/constants";
import { localized } from "@/lib/localized";
import { collective as collectiveRoute } from "@/lib/routes";
import type { Collective } from "@/types/collective";
import type { LocaleCode } from "@/types/common";

export function CollectiveCard({ collective }: { collective: Collective }) {
  const t = useTranslations();
  const locale = useLocale() as LocaleCode;
  const region = regionById(collective.regionId);

  return (
    <Link href={collectiveRoute(collective.type, collective.slug)} className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
      <Card className="h-full gap-3 p-4 transition-shadow group-hover:shadow-md">
        <div className="flex items-start gap-3">
          <Image src={collective.logoUrl} alt="" width={56} height={56} className="size-14 shrink-0 rounded-xl border object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="line-clamp-2 text-sm font-semibold">{collective.name}</h3>
              {collective.verified && <VerifiedBadge />}
            </div>
            <div className="mt-1">
              <StatusBadge tone="blue">{t(`labels.collectiveType.${collective.type}`)}</StatusBadge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {collective.city}
            {region ? `, ${localized(region.name, locale)}` : ""}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{t("cards.members", { count: collective.members.length })}</span>
          <span>{t("cards.founded", { year: collective.foundedYear })}</span>
        </div>
      </Card>
    </Link>
  );
}
