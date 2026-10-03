import Image from "next/image";
import { ArrowLeft, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { DeadlineLabel } from "@/components/casting/deadline-label";
import { ContactList } from "@/components/layout/contact-list";
import { EmptyState } from "@/components/layout/empty-state";
import { InfoBlock } from "@/components/talent/profile-sections";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { regionById } from "@/lib/constants";
import { localized } from "@/lib/localized";
import { casting as castingRoute, vacancy as vacancyRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import type { Casting, Vacancy } from "@/types/opportunity";
import { loadOrganization } from "./load-collective";

type Opening = Casting | Vacancy;

function OpeningRow({ item, href, statusLabel }: { item: Opening; href: string; statusLabel: string }) {
  const closed = item.status === "closed";
  return (
    <Link href={href} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
      <Card className="gap-2 p-4 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold">{item.title}</h3>
          <StatusBadge tone={closed ? "red" : "green"}>{statusLabel}</StatusBadge>
        </div>
        <DeadlineLabel deadline={item.deadline} closed={closed} />
      </Card>
    </Link>
  );
}

export async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [org, t, labels, locale] = await Promise.all([
    loadOrganization(slug),
    getTranslations("orgPage"),
    getTranslations(),
    getLocale() as Promise<LocaleCode>,
  ]);
  if (!org) notFound();

  const region = regionById(org.regionId);
  const hasOpenings = org.castings.length + org.vacancies.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-3 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-5 rounded-2xl border bg-card p-4 sm:p-6">
        <Link href="/organizations" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          {labels("profile.backToCatalog")}
        </Link>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Image src={org.logoUrl} alt="" width={112} height={112} priority className="size-24 shrink-0 rounded-2xl border object-cover sm:size-28" />
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="min-w-0 break-words text-2xl font-semibold tracking-tight sm:text-3xl">{org.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <StatusBadge tone="blue">{labels(`catalog.orgKind.${org.kind}`)}</StatusBadge>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" aria-hidden />
                {org.city}
                {region ? `, ${localized(region.name, locale)}` : ""}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <InfoBlock id="about" title={t("about")}>
            <p className="whitespace-pre-line break-words text-sm leading-relaxed">{org.description}</p>
          </InfoBlock>

          {!hasOpenings && <EmptyState title={t("noOpenings")} />}
          {org.castings.length > 0 && (
            <InfoBlock id="castings" title={t("castings")}>
              <div className="grid gap-3 sm:grid-cols-2">
                {org.castings.map((c) => (
                  <OpeningRow key={c.id} item={c} href={castingRoute(c.id)} statusLabel={labels(`labels.status.${c.status}`)} />
                ))}
              </div>
            </InfoBlock>
          )}
          {org.vacancies.length > 0 && (
            <InfoBlock id="vacancies" title={t("vacancies")}>
              <div className="grid gap-3 sm:grid-cols-2">
                {org.vacancies.map((v) => (
                  <OpeningRow key={v.id} item={v} href={vacancyRoute(v.id)} statusLabel={labels(`labels.status.${v.status}`)} />
                ))}
              </div>
            </InfoBlock>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-6 rounded-2xl border bg-muted/30 p-4 sm:p-5 lg:self-start">
          <InfoBlock id="contacts" title={t("contacts")}>
            <ContactList contacts={org.contacts} />
          </InfoBlock>
        </aside>
      </div>
    </div>
  );
}
