import Image from "next/image";
import { MapPin } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { regionById } from "@/lib/constants";
import { localized } from "@/lib/localized";
import { talent as talentRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import type { TalentProfile } from "@/types/talent";
import { AvailabilityBadge } from "./availability-badge";
import { VerifiedBadge } from "./verified-badge";

export function TalentCard({ talent, collectiveName }: { talent: TalentProfile; collectiveName?: string }) {
  const t = useTranslations();
  const locale = useLocale() as LocaleCode;
  const region = regionById(talent.regionId);

  return (
    <Link href={talentRoute(talent.kind, talent.slug)} className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
      <Card className="h-full gap-3 p-4 transition-shadow group-hover:shadow-md">
        <div className="flex items-start gap-3">
          <Image
            src={talent.photoUrl}
            alt={talent.fullName}
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-full border object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold">{talent.fullName}</h3>
              {talent.verified && <VerifiedBadge />}
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">{talent.specialty}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {talent.city}
            {region ? `, ${localized(region.name, locale)}` : ""}
          </span>
        </div>
        {collectiveName && <p className="truncate text-xs text-muted-foreground">{collectiveName}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <AvailabilityBadge value={talent.availability} />
          <span className="text-xs text-muted-foreground">{t("cards.experience", { count: talent.experienceYears })}</span>
        </div>
      </Card>
    </Link>
  );
}
