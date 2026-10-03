import Image from "next/image";
import { MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { VerifiedBadge } from "@/components/talent/verified-badge";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { regionById } from "@/lib/constants";
import { localized } from "@/lib/localized";
import { organization as organizationRoute } from "@/lib/routes";
import type { Organization } from "@/types/collective";
import type { LocaleCode } from "@/types/common";

export function OrganizationCard({ organization }: { organization: Organization }) {
  const t = useTranslations("catalog");
  const locale = useLocale() as LocaleCode;
  const region = regionById(organization.regionId);

  return (
    <Link href={organizationRoute(organization.slug)} className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
      <Card className="h-full gap-3 p-4 transition-shadow group-hover:shadow-md">
        <div className="flex items-start gap-3">
          <Image src={organization.logoUrl} alt="" width={56} height={56} className="size-14 shrink-0 rounded-xl border object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="line-clamp-2 text-sm font-semibold">{organization.name}</h3>
              {organization.verification === "approved" && <VerifiedBadge />}
            </div>
            <div className="mt-1">
              <StatusBadge tone="blue">{t(`orgKind.${organization.kind}`)}</StatusBadge>
            </div>
          </div>
        </div>
        <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {organization.city}
            {region ? `, ${localized(region.name, locale)}` : ""}
          </span>
        </div>
      </Card>
    </Link>
  );
}
