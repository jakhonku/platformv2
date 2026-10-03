import { getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/content/project-card";
import { CardSkeletons } from "@/components/layout/card-skeletons";
import { EmptyState } from "@/components/layout/empty-state";
import { getProjects } from "@/lib/data";
import { HomeSection } from "./home-section";

const GRID3 = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

async function ProjectsList() {
  const [t, projects] = await Promise.all([getTranslations("home"), getProjects({ status: "active" }, 1, 3)]);
  if (projects.items.length === 0) return <EmptyState title={t("emptyTitle")} text={t("emptyText")} />;
  return (
    <div className={GRID3}>
      {projects.items.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}

export async function ProjectsSection() {
  const t = await getTranslations("home");
  return (
    <HomeSection
      id="projects"
      title={t("projectsTitle")}
      href="/projects"
      hrefLabel={t("viewAll")}
      fallback={
        <div className={GRID3}>
          <CardSkeletons count={3} media />
        </div>
      }
    >
      <ProjectsList />
    </HomeSection>
  );
}
