import Image from "next/image";
import { ArrowLeft, MapPin } from "@/components/icons";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { CardSkeletons } from "@/components/layout/card-skeletons";
import { ContactList } from "@/components/layout/contact-list";
import { MediaTabs } from "@/components/media/media-tabs";
import { InfoBlock, ProfileSection } from "@/components/talent/profile-sections";
import { TalentCard } from "@/components/talent/talent-card";
import { VerifiedBadge } from "@/components/talent/verified-badge";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { regionById } from "@/lib/constants";
import { getMediaForOwner } from "@/lib/data";
import { localized } from "@/lib/localized";
import { collectiveSection } from "@/lib/routes";
import type { CollectiveType } from "@/types/collective";
import type { LocaleCode } from "@/types/common";
import type { MediaItem } from "@/types/media";
import { EventsList } from "./events-list";
import { loadCollective } from "./load-collective";
import { MembersList } from "./members-list";

async function CollectiveMedia({ promise }: { promise: Promise<MediaItem[]> }) {
  return <MediaTabs items={await promise} />;
}

export async function CollectivePage({ type, params }: { type: CollectiveType; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [c, t, labels, locale] = await Promise.all([
    loadCollective(slug),
    getTranslations("collectivePage"),
    getTranslations(),
    getLocale() as Promise<LocaleCode>,
  ]);
  // Orkestr slugi /choirs/ ostida (va aksincha) ochilmaydi
  if (!c || c.type !== type) notFound();

  const region = regionById(c.regionId);
  const media = getMediaForOwner(c.id);
  const conductor = c.conductor && c.conductor.moderation === "approved" ? c.conductor : null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-3 py-6 sm:px-6 sm:py-8">
      <header className="glass-strong flex flex-col gap-5 rounded-[2rem] p-5 sm:p-8">
        <Link href={collectiveSection(c.type)} className="glass inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-foreground/70 hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          {labels("profile.backToCatalog")}
        </Link>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Image src={c.logoUrl} alt="" width={112} height={112} priority className="size-28 shrink-0 rounded-[1.75rem] object-cover shadow-xl ring-4 ring-(--avatar-ring) sm:size-32" />
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2">
              <h1 className="min-w-0 break-words text-3xl font-semibold tracking-tight sm:text-4xl">{c.name}</h1>
              {c.verified && <VerifiedBadge />}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <StatusBadge tone="blue">{labels(`labels.collectiveType.${c.type}`)}</StatusBadge>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" aria-hidden />
                {c.city}
                {region ? `, ${localized(region.name, locale)}` : ""}
              </span>
              <span>{labels("cards.founded", { year: c.foundedYear })}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <p className="glass whitespace-pre-line break-words rounded-3xl p-5 text-sm leading-relaxed sm:p-6">{c.description}</p>

          {conductor && (
            <InfoBlock id="conductor" title={t("conductor")}>
              <div className="max-w-sm">
                <TalentCard talent={conductor} />
              </div>
            </InfoBlock>
          )}

          <InfoBlock id="members" title={t("members")}>
            <MembersList members={c.members} profiles={c.memberProfiles} />
          </InfoBlock>

          <InfoBlock id="events" title={t("events")}>
            <EventsList events={c.events} />
          </InfoBlock>

          <ProfileSection
            id="media"
            title={t("media")}
            fallback={
              <div className="grid gap-4 sm:grid-cols-2">
                <CardSkeletons count={2} media />
              </div>
            }
          >
            <CollectiveMedia promise={media} />
          </ProfileSection>
        </div>

        <aside className="flex min-w-0 flex-col gap-6 glass rounded-3xl p-5 sm:p-6 lg:sticky lg:top-24 lg:self-start">
          <InfoBlock id="contacts" title={t("contacts")}>
            <ContactList contacts={c.contacts} />
          </InfoBlock>
          {c.repertoire.length > 0 && (
            <InfoBlock id="repertoire" title={t("repertoire")}>
              <ul className="flex flex-wrap gap-2">
                {c.repertoire.map((r) => (
                  <li key={r}>
                    <Badge variant="secondary" className="h-auto whitespace-normal break-words py-1">
                      {r}
                    </Badge>
                  </li>
                ))}
              </ul>
            </InfoBlock>
          )}
        </aside>
      </div>
    </div>
  );
}
