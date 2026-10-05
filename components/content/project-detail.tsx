import type { Metadata } from "next";
import { CalendarDays } from "@/components/icons";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { CollectiveCard } from "@/components/collective/collective-card";
import { SectionBoundary } from "@/components/home/section-boundary";
import { CardSkeletons } from "@/components/layout/card-skeletons";
import { DetailShell } from "@/components/listing/detail-shell";
import { detailMetadata } from "@/components/listing/metadata";
import { InfoBlock } from "@/components/talent/profile-sections";
import { TalentCard } from "@/components/talent/talent-card";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { getCollectiveById, getOrganizationById, getTalentById } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { organization as organizationRoute, project as projectRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import type { Collective } from "@/types/collective";
import type { ProjectStatus } from "@/types/content";
import type { TalentProfile } from "@/types/talent";
import { CoverImage } from "./cover-image";
import { loadProject } from "./load-content";

const TONE: Record<ProjectStatus, Tone> = { planned: "blue", active: "green", completed: "gray" };
const GRID = "grid gap-4 sm:grid-cols-2";

export async function projectMetadata(slug: string, locale: string): Promise<Metadata> {
  const project = await loadProject(slug);
  if (!project) return {};
  return detailMetadata({ title: project.title, description: project.description, path: projectRoute(slug), locale, image: project.imageUrl });
}

async function Collectives({ ids, title }: { ids: string[]; title: string }) {
  const found = (await Promise.all(ids.map((id) => getCollectiveById(id)))).filter((c): c is Collective => c !== null && c.moderation === "approved");
  if (found.length === 0) return null;
  return (
    <InfoBlock id="collectives" title={title}>
      <div className={GRID}>
        {found.map((c) => (
          <CollectiveCard key={c.id} collective={c} />
        ))}
      </div>
    </InfoBlock>
  );
}

async function Talents({ ids, title }: { ids: string[]; title: string }) {
  const found = (await Promise.all(ids.map((id) => getTalentById(id)))).filter((t): t is TalentProfile => t !== null && t.moderation === "approved");
  if (found.length === 0) return null;
  return (
    <InfoBlock id="talents" title={title}>
      <div className={GRID}>
        {found.map((t) => (
          <TalentCard key={t.id} talent={t} />
        ))}
      </div>
    </InfoBlock>
  );
}

async function OrganizationLink({ id, title }: { id: string; title: string }) {
  const org = await getOrganizationById(id);
  if (!org) return null;
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">{title}: </span>
      <Link href={organizationRoute(org.slug)} className="font-medium text-primary hover:underline">
        {org.name}
      </Link>
    </p>
  );
}

export async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, t, labels, locale] = await Promise.all([loadProject(slug), getTranslations("projectPage"), getTranslations("labels.status"), getLocale() as Promise<LocaleCode>]);
  if (!project) notFound();

  return (
    <DetailShell backHref="/projects" backLabel={t("back")}>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <CoverImage src={project.imageUrl} alt={project.title} />
        <div className="flex flex-col gap-3 p-4 sm:p-6">
          <div>
            <StatusBadge tone={TONE[project.status]}>{labels(project.status)}</StatusBadge>
          </div>
          <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h1>
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" aria-hidden />
            {t("period")}: {formatDate(project.startDate, locale)} – {project.endDate ? formatDate(project.endDate, locale) : t("ongoing")}
          </p>
          {project.organizationId && (
            <SectionBoundary fallback={null}>
              <OrganizationLink id={project.organizationId} title={t("organization")} />
            </SectionBoundary>
          )}
        </div>
      </div>
      <p className="whitespace-pre-line break-words text-sm leading-relaxed">{project.description}</p>
      {project.collectiveIds.length > 0 && (
        <SectionBoundary fallback={<CardSkeletons count={2} />}>
          <Collectives ids={project.collectiveIds} title={t("collectives")} />
        </SectionBoundary>
      )}
      {project.talentIds.length > 0 && (
        <SectionBoundary fallback={<CardSkeletons count={2} />}>
          <Talents ids={project.talentIds} title={t("talents")} />
        </SectionBoundary>
      )}
    </DetailShell>
  );
}
