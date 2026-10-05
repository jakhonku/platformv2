import Image from "next/image";
import { ExternalLink, MapPin } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { ContactList } from "@/components/layout/contact-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { regionById } from "@/lib/constants";
import { localized } from "@/lib/localized";
import { organization as organizationRoute } from "@/lib/routes";
import type { Organization } from "@/types/collective";
import type { LocaleCode } from "@/types/common";

export function OrgProfile({ organization }: { organization: Organization }) {
  const t = useTranslations("cabinetPage.orgProfile");
  const tk = useTranslations("catalog.orgKind");
  const tm = useTranslations("cabinetPage.moderation");
  const locale = useLocale() as LocaleCode;
  const region = regionById(organization.regionId);

  return (
    <Card className="max-w-3xl gap-4 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Image src={organization.logoUrl} alt="" width={96} height={96} className="size-20 shrink-0 rounded-2xl border object-cover" />
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="break-words text-xl font-semibold">{organization.name}</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <StatusBadge tone="blue">{tk(organization.kind)}</StatusBadge>
            <StatusBadge tone={organization.verification === "approved" ? "green" : organization.verification === "pending" ? "yellow" : "red"}>{tm(organization.verification)}</StatusBadge>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {organization.city}
              {region ? `, ${localized(region.name, locale)}` : ""}
            </span>
          </div>
        </div>
      </div>
      <p className="whitespace-pre-line break-words text-sm leading-relaxed">{organization.description}</p>
      <div>
        <h3 className="mb-2 text-sm font-semibold">{t("contacts")}</h3>
        <ContactList contacts={organization.contacts} />
      </div>
      <Button nativeButton={false} variant="outline" className="w-fit" render={<Link href={organizationRoute(organization.slug)} />}>
        <ExternalLink aria-hidden />
        {t("publicPage")}
      </Button>
    </Card>
  );
}
