import Image from "next/image";
import { ArrowLeft, MapPin } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { instrumentById, regionById } from "@/lib/constants";
import { localized } from "@/lib/localized";
import { talentSection } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import type { TalentProfile } from "@/types/talent";
import { AvailabilityBadge } from "./availability-badge";
import { InviteDialog } from "./invite-dialog";
import { VerifiedBadge } from "./verified-badge";

export function ProfileHeader({ talent }: { talent: TalentProfile }) {
  const t = useTranslations("profile");
  const kindLabel = useTranslations("labels.talentKind");
  const locale = useLocale() as LocaleCode;
  const region = regionById(talent.regionId);
  const instruments = talent.instrumentIds.flatMap((id) => {
    const i = instrumentById(id);
    return i ? [localized(i.name, locale)] : [];
  });

  return (
    <header className="flex flex-col gap-5 rounded-2xl border bg-card p-4 sm:p-6">
      <Link
        href={talentSection(talent.kind)}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("backToCatalog")}
      </Link>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Image
          src={talent.photoUrl}
          alt={talent.fullName}
          width={128}
          height={128}
          priority
          className="size-24 shrink-0 rounded-full border object-cover sm:size-32"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">{kindLabel(talent.kind)}</p>
          <div className="flex items-center gap-2">
            <h1 className="min-w-0 break-words text-2xl font-semibold tracking-tight sm:text-3xl">{talent.fullName}</h1>
            {talent.verified && <VerifiedBadge />}
          </div>
          <p className="text-muted-foreground">{talent.specialty}</p>
          {instruments.length > 0 && <p className="text-sm">{instruments.join(", ")}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {talent.city}
              {region ? `, ${localized(region.name, locale)}` : ""}
            </span>
            <AvailabilityBadge value={talent.availability} />
          </div>
        </div>
        <div className="sm:self-start">
          <InviteDialog talentId={talent.id} talentName={talent.fullName} />
        </div>
      </div>
    </header>
  );
}
