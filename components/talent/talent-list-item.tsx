import Image from "next/image";
import { MapPin } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { instrumentById, regionById, voiceTypeById } from "@/lib/constants";
import { localized } from "@/lib/localized";
import { talent as talentRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import type { TalentProfile } from "@/types/talent";
import { AvailabilityBadge } from "./availability-badge";
import { cardBio } from "./talent-card";
import { VerifiedBadge } from "./verified-badge";

/** Ro'yxat ko'rinishidagi gorizontal qator (katalogda `view=list`) */
export function TalentListItem({ talent, collectiveName }: { talent: TalentProfile; collectiveName?: string }) {
  const t = useTranslations();
  const locale = useLocale() as LocaleCode;
  const region = regionById(talent.regionId);
  const voice = talent.voiceTypeId ? voiceTypeById(talent.voiceTypeId) : undefined;
  const skills = [
    ...(voice ? [localized(voice.name, locale)] : []),
    ...talent.instrumentIds.flatMap((id) => {
      const i = instrumentById(id);
      return i ? [localized(i.name, locale)] : [];
    }),
  ];

  return (
    <Link href={talentRoute(talent.kind, talent.slug)} className="group block rounded-3xl focus-visible:outline-2 focus-visible:outline-ring">
      <Card className="flex-row items-center gap-4 p-4 transition-shadow group-hover:shadow-md">
        <Image src={talent.photoUrl} alt={talent.fullName} width={56} height={56} className="size-14 shrink-0 rounded-full object-cover shadow-md ring-2 ring-(--avatar-ring)" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold">{talent.fullName}</h3>
            {talent.verified && <VerifiedBadge />}
          </div>
          <p className="line-clamp-1 text-sm text-muted-foreground">{talent.specialty}</p>
          {cardBio(talent) && <p className="mt-1 line-clamp-1 text-sm text-foreground/70">{cardBio(talent)}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {talent.city}
              {region ? `, ${localized(region.name, locale)}` : ""}
            </span>
            {skills.length > 0 && <span className="truncate">{skills.join(" · ")}</span>}
            {collectiveName && <span className="truncate">{collectiveName}</span>}
          </div>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
          <AvailabilityBadge value={talent.availability} />
          <span className="text-xs text-muted-foreground">{t("cards.experience", { count: talent.experienceYears })}</span>
        </div>
      </Card>
    </Link>
  );
}
