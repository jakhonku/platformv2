import type { Metadata } from "next";
import { CalendarClock, MapPin, Wallet } from "@/components/icons";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ContactList } from "@/components/layout/contact-list";
import { DetailShell } from "@/components/listing/detail-shell";
import { detailMetadata } from "@/components/listing/metadata";
import { InfoBlock } from "@/components/talent/profile-sections";
import { AppIcon } from "@/components/ui/app-icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { regionById } from "@/lib/constants";
import { getDemoApplicant, getDemoRole } from "@/lib/demo/server";
import { formatDate, formatMoneyUzs } from "@/lib/format";
import { localized } from "@/lib/localized";
import { casting as castingRoute, organization as organizationRoute, vacancy as vacancyRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import { ApplyDialog } from "./apply-dialog";
import { DeadlineLabel } from "./deadline-label";
import { loadCasting, loadVacancy } from "./load-opportunity";
import { RequirementsList } from "./requirements-list";

type Kind = "casting" | "vacancy";

const load = (kind: Kind, id: string) => (kind === "casting" ? loadCasting(id) : loadVacancy(id));

export async function opportunityMetadata(kind: Kind, id: string, locale: string): Promise<Metadata> {
  const item = await load(kind, id);
  if (!item) return {};
  return detailMetadata({
    title: `${item.title} — ${item.organizationName}`,
    description: item.description,
    path: kind === "casting" ? castingRoute(id) : vacancyRoute(id),
    locale,
  });
}

function Meta({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <AppIcon icon={Icon} size="sm" />
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
}

export async function OpportunityDetail({ kind, params }: { kind: Kind; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, t, labels, locale, role, applicant] = await Promise.all([
    load(kind, id),
    getTranslations("opportunity"),
    getTranslations("labels"),
    getLocale() as Promise<LocaleCode>,
    getDemoRole(),
    getDemoApplicant(),
  ]);
  if (!item) notFound();

  const closed = item.status === "closed";
  const org = item.organization;
  const vacancy = kind === "vacancy" ? (item as Extract<typeof item, { employment: string }>) : null;
  const casting = kind === "casting" ? (item as Extract<typeof item, { eventDate: string }>) : null;
  const regionName = vacancy ? regionById(vacancy.regionId) : undefined;
  const hasSalary = vacancy?.salaryFromUzs !== undefined && vacancy?.salaryToUzs !== undefined;

  return (
    <DetailShell backHref={kind === "casting" ? "/castings" : "/vacancies"} backLabel={kind === "casting" ? t("backCastings") : t("backVacancies")}>
      <header className="glass-strong flex flex-col gap-3 rounded-[2rem] p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="min-w-0 break-words text-3xl font-semibold tracking-tight sm:text-4xl">{item.title}</h1>
          <StatusBadge tone={closed ? "red" : "green"}>{labels(`status.${item.status}`)}</StatusBadge>
        </div>
        {org && (
          <Link href={organizationRoute(org.slug)} className="w-fit text-sm font-medium text-primary hover:underline">
            {org.name}
          </Link>
        )}
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
          {casting && (
            <>
              <Meta icon={MapPin}>{casting.location}</Meta>
              <Meta icon={CalendarClock}>
                {t("meta.eventDate")}: {formatDate(casting.eventDate, locale, "long")}
              </Meta>
            </>
          )}
          {vacancy && (
            <>
              <Meta icon={MapPin}>
                {vacancy.city}
                {regionName ? `, ${localized(regionName.name, locale)}` : ""}
              </Meta>
              <span>{labels(`employment.${vacancy.employment}`)}</span>
              {hasSalary && (
                <Meta icon={Wallet}>
                  {t("meta.salary")}: {formatMoneyUzs(vacancy!.salaryFromUzs!, locale)} – {formatMoneyUzs(vacancy!.salaryToUzs!, locale)}
                </Meta>
              )}
            </>
          )}
        </div>
        <DeadlineLabel deadline={item.deadline} closed={closed} />
        <div className="pt-1">
          <ApplyDialog target={{ kind, id: item.id, title: item.title }} applicant={applicant} role={role} closed={closed} />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <InfoBlock card id="description" title={t("description")}>
            <p className="whitespace-pre-line break-words text-sm leading-relaxed">{item.description}</p>
          </InfoBlock>
          {Object.keys(item.requirements).length > 0 && (
            <InfoBlock card id="requirements" title={t("requirements")}>
              <RequirementsList requirements={item.requirements} />
            </InfoBlock>
          )}
        </div>
        {org && (
          <aside className="flex min-w-0 flex-col gap-4 glass rounded-3xl p-5 sm:p-6 lg:sticky lg:top-24 lg:self-start">
            <InfoBlock id="org" title={t("organization")}>
              <Link href={organizationRoute(org.slug)} className="text-sm font-medium text-primary hover:underline">
                {org.name}
              </Link>
            </InfoBlock>
            <InfoBlock id="contacts" title={t("contacts")}>
              <ContactList contacts={org.contacts} />
            </InfoBlock>
          </aside>
        )}
      </div>
    </DetailShell>
  );
}
