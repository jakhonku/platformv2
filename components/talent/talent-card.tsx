import Image from "next/image";
import { ArrowRight, MapPin } from "@/components/icons";
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

/** Kartochkadagi qisqa bio: foydalanuvchining o'zi yozgan qisqa tavsif, bo'lmasa to'liq bio boshi */
export const cardBio = (t: Pick<TalentProfile, "shortBio" | "bio">): string => (t.shortBio?.trim() || t.bio?.trim() || "").replace(/\s+/g, " ");

export function TalentCard({ talent, collectiveName }: { talent: TalentProfile; collectiveName?: string }) {
  const t = useTranslations();
  const locale = useLocale() as LocaleCode;
  const region = regionById(talent.regionId);
  const bio = cardBio(talent);

  return (
    <Link href={talentRoute(talent.kind, talent.slug)} className="group block h-full rounded-3xl focus-visible:outline-2 focus-visible:outline-ring">
      <Card className="glass glass-hover h-full gap-4 rounded-3xl border-0 p-5 ring-0">
        <div className="flex items-start gap-4">
          <Image
            src={talent.photoUrl}
            alt={talent.fullName}
            width={64}
            height={64}
            unoptimized={talent.photoUrl.startsWith("data:")}
            className="size-16 shrink-0 rounded-full object-cover shadow-md ring-2 ring-(--avatar-ring)"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-primary/80 uppercase">{t(`labels.talentKind.${talent.kind}`)}</p>
            <div className="mt-0.5 flex items-start gap-1.5">
              <h3 className="display text-lg leading-snug break-words">{talent.fullName}</h3>
              {talent.verified && <VerifiedBadge />}
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">{talent.specialty}</p>
          </div>
        </div>

        {bio && <p className="line-clamp-3 border-l-2 border-primary/25 pl-3 text-sm leading-relaxed text-foreground/70">{bio}</p>}

        <div className="mt-auto flex flex-col gap-3 border-t border-foreground/10 pt-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">
                  {talent.city}
                  {region ? `, ${localized(region.name, locale)}` : ""}
                </span>
              </span>
              {collectiveName && <span className="truncate pl-5">{collectiveName}</span>}
            </div>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <AvailabilityBadge value={talent.availability} />
            <span className="text-xs text-muted-foreground">{t("cards.experience", { count: talent.experienceYears })}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
