import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { project as projectRoute } from "@/lib/routes";
import type { Project, ProjectStatus } from "@/types/content";
import { CoverImage } from "./cover-image";

const TONE: Record<ProjectStatus, Tone> = { planned: "blue", active: "green", completed: "gray" };

export function ProjectCard({ project }: { project: Project }) {
  const t = useTranslations("labels.status");
  return (
    <Link href={projectRoute(project.slug)} className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
      <Card className="h-full gap-0 overflow-hidden p-0 transition-shadow group-hover:shadow-md">
        <CoverImage src={project.imageUrl} />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div>
            <StatusBadge tone={TONE[project.status]}>{t(project.status)}</StatusBadge>
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold">{project.title}</h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">{project.description}</p>
        </div>
      </Card>
    </Link>
  );
}
