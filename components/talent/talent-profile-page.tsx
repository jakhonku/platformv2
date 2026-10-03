import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionBoundary } from "@/components/home/section-boundary";
import { CardSkeletons } from "@/components/layout/card-skeletons";
import { ContactList } from "@/components/layout/contact-list";
import { MediaTabs } from "@/components/media/media-tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { getCollectionsForOwner, getCollectiveById, getMediaForOwner } from "@/lib/data";
import { collective as collectiveRoute } from "@/lib/routes";
import type { MediaItem } from "@/types/media";
import type { ComposerProfile, ConductorProfile, TalentKind, TalentProfile } from "@/types/talent";
import { CollectionsList } from "./collections-section";
import { ComposerWorks } from "./composer-works";
import { ConductorEnsembles } from "./conductor-ensembles";
import { loadTalent } from "./load-talent";
import { InfoBlock, ProfileSection } from "./profile-sections";
import { ProfileHeader } from "./profile-header";
import { VoiceRangeBar } from "./voice-range-bar";

const isConductor = (t: TalentProfile): t is ConductorProfile => t.kind === "conductor" && "ensembleTypes" in t;
const isComposer = (t: TalentProfile): t is ComposerProfile => t.kind === "composer" && "works" in t;

async function PortfolioMedia({ promise }: { promise: Promise<MediaItem[]> }) {
  return <MediaTabs items={await promise} />;
}

async function CurrentCollective({ collectiveId }: { collectiveId: string }) {
  const c = await getCollectiveById(collectiveId);
  if (!c) return null;
  return (
    <Link href={collectiveRoute(c.type, c.slug)} className="text-sm font-medium text-primary hover:underline">
      {c.name}
    </Link>
  );
}

export async function TalentProfilePage({ kind, params }: { kind: TalentKind; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [talent, t] = await Promise.all([loadTalent(slug), getTranslations("profile")]);
  // Boshqa rolning slugi shu bo'limda ochilmaydi (masalan dirijyor slugi /musicians/ ostida)
  if (!talent || talent.kind !== kind) notFound();

  const media = getMediaForOwner(talent.id);
  const collections = getCollectionsForOwner(talent.id);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-3 py-6 sm:px-6 sm:py-8">
      <ProfileHeader talent={talent} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <InfoBlock id="about" title={t("about")}>
            <p className="whitespace-pre-line break-words text-sm leading-relaxed">{talent.bio || t("noBio")}</p>
          </InfoBlock>

          {talent.kind === "vocalist" && (talent.voiceTypeId || talent.voiceRange) && (
            <InfoBlock id="voice" title={t("voiceRange")}>
              <VoiceRangeBar voiceTypeId={talent.voiceTypeId} range={talent.voiceRange} />
            </InfoBlock>
          )}
          {isConductor(talent) && talent.ensembleTypes.length > 0 && (
            <InfoBlock id="ensembles" title={t("ensembles")}>
              <ConductorEnsembles conductor={talent} />
            </InfoBlock>
          )}
          {isComposer(talent) && (
            <InfoBlock id="works" title={t("works")}>
              <ComposerWorks composer={talent} />
            </InfoBlock>
          )}

          <ProfileSection
            id="portfolio"
            title={t("portfolio")}
            fallback={
              <div className="grid gap-4 sm:grid-cols-2">
                <CardSkeletons count={2} media />
              </div>
            }
          >
            <PortfolioMedia promise={media} />
          </ProfileSection>

          <ProfileSection
            id="collections"
            title={t("collections")}
            fallback={
              <div className="grid gap-3 sm:grid-cols-2">
                <CardSkeletons count={2} />
              </div>
            }
          >
            <CollectionsList promise={collections} />
          </ProfileSection>
        </div>

        <aside className="flex min-w-0 flex-col gap-6 rounded-2xl border bg-muted/30 p-4 sm:p-5 lg:self-start">
          {talent.currentCollectiveId && (
            <InfoBlock id="current-collective" title={t("currentCollective")}>
              <SectionBoundary fallback={<Skeleton className="h-5 w-40" />}>
                <CurrentCollective collectiveId={talent.currentCollectiveId} />
              </SectionBoundary>
            </InfoBlock>
          )}
          <InfoBlock id="contacts" title={t("contacts")}>
            <ContactList contacts={talent.contacts} />
          </InfoBlock>
          {talent.education.length > 0 && (
            <InfoBlock id="education" title={t("education")}>
              <ul className="flex flex-col gap-3">
                {talent.education.map((e, i) => (
                  <li key={i} className="text-sm">
                    <p className="break-words font-medium">{e.institution}</p>
                    <p className="text-muted-foreground">
                      {e.degree} · {t("years", { from: e.yearFrom, to: e.yearTo ?? t("present") })}
                    </p>
                  </li>
                ))}
              </ul>
            </InfoBlock>
          )}
          {talent.experience.length > 0 && (
            <InfoBlock id="experience" title={t("experience")}>
              <ul className="flex flex-col gap-3">
                {talent.experience.map((e, i) => (
                  <li key={i} className="text-sm">
                    <p className="break-words font-medium">{e.organization}</p>
                    <p className="text-muted-foreground">
                      {e.position} · {t("years", { from: e.yearFrom, to: e.yearTo ?? t("present") })}
                    </p>
                  </li>
                ))}
              </ul>
            </InfoBlock>
          )}
          {talent.repertoire.length > 0 && (
            <InfoBlock id="repertoire" title={t("repertoire")}>
              <ul className="flex flex-wrap gap-2">
                {talent.repertoire.map((r) => (
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
