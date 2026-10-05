import type { Metadata } from "next";
import { CalendarDays, MapPin } from "@/components/icons";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { DeadlineLabel } from "@/components/casting/deadline-label";
import { DetailShell } from "@/components/listing/detail-shell";
import { detailMetadata } from "@/components/listing/metadata";
import { InfoBlock } from "@/components/talent/profile-sections";
import { AppIcon } from "@/components/ui/app-icon";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { categoryById, regionById } from "@/lib/constants";
import { getOrganizationById } from "@/lib/data";
import { formatDateRange, formatMoneyUzs } from "@/lib/format";
import { localized } from "@/lib/localized";
import { competition as competitionRoute, festival as festivalRoute, organization as organizationRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import type { EventStatus } from "@/types/content";
import { CoverImage } from "./cover-image";
import { loadCompetition, loadFestival } from "./load-event";

type Kind = "competition" | "festival";
const TONE: Record<EventStatus, Tone> = { upcoming: "blue", ongoing: "yellow", finished: "gray" };
const load = (kind: Kind, slug: string) => (kind === "competition" ? loadCompetition(slug) : loadFestival(slug));

export async function eventMetadata(kind: Kind, slug: string, locale: string): Promise<Metadata> {
  const event = await load(kind, slug);
  if (!event) return {};
  return detailMetadata({
    title: event.title,
    description: event.description,
    path: kind === "competition" ? competitionRoute(slug) : festivalRoute(slug),
    locale,
    image: event.imageUrl,
  });
}

export async function EventDetail({ kind, params }: { kind: Kind; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, t, labels, locale] = await Promise.all([load(kind, slug), getTranslations("eventPage"), getTranslations("labels"), getLocale() as Promise<LocaleCode>]);
  if (!event) notFound();

  const organizer = event.organizerId ? await getOrganizationById(event.organizerId) : null;
  const region = regionById(event.regionId);
  const competition = "deadline" in event ? event : null;
  const festival = "lineup" in event ? event : null;
  const category = competition ? categoryById(competition.categoryId) : undefined;

  return (
    <DetailShell backHref={kind === "competition" ? "/competitions" : "/festivals"} backLabel={kind === "competition" ? t("backCompetitions") : t("backFestivals")}>
      <div className="glass-strong overflow-hidden rounded-[2rem]">
        <CoverImage src={event.imageUrl} alt={event.title} />
        <div className="flex flex-col gap-3 p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="blue">{labels(`eventKind.${kind}`)}</StatusBadge>
            <StatusBadge tone={TONE[event.status]}>{labels(`status.${event.status}`)}</StatusBadge>
          </div>
          <h1 className="break-words text-3xl font-semibold tracking-tight sm:text-4xl">{event.title}</h1>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={CalendarDays} size="sm" />
              {formatDateRange(event.startDate, event.endDate, locale)}
            </span>
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={MapPin} size="sm" />
              {event.city}
              {region ? `, ${localized(region.name, locale)}` : ""}
            </span>
          </div>
          {competition && <DeadlineLabel deadline={competition.deadline} closed={event.status !== "upcoming"} />}
          {competition?.prizeFundUzs !== undefined && (
            <p className="text-sm">
              <span className="text-muted-foreground">{t("prizeFund")}: </span>
              <span className="font-medium">{formatMoneyUzs(competition.prizeFundUzs, locale)}</span>
            </p>
          )}
          {category && (
            <p className="text-sm">
              <span className="text-muted-foreground">{t("category")}: </span>
              <span className="font-medium">{localized(category.name, locale)}</span>
            </p>
          )}
        </div>
      </div>

      <InfoBlock card id="about" title={labels(`eventKind.${kind}`)}>
        <p className="whitespace-pre-line break-words text-sm leading-relaxed">{event.description}</p>
      </InfoBlock>
      {festival && festival.lineup.length > 0 && (
        <InfoBlock id="lineup" title={t("lineup")}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {festival.lineup.map((name) => (
              <li key={name} className="glass min-w-0 break-words rounded-2xl px-4 py-3 text-sm">
                {name}
              </li>
            ))}
          </ul>
        </InfoBlock>
      )}
      {organizer && (
        <InfoBlock card id="organizer" title={t("organizer")}>
          <Link href={organizationRoute(organizer.slug)} className="w-fit text-sm font-medium text-primary hover:underline">
            {organizer.name}
          </Link>
        </InfoBlock>
      )}
    </DetailShell>
  );
}
