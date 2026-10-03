import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { ComposerProfile } from "@/types/talent";

export function ComposerWorks({ composer }: { composer: ComposerProfile }) {
  const t = useTranslations("profile");
  return (
    <div className="flex flex-col gap-4">
      {composer.genres.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("genres")}:</span>
          {composer.genres.map((g) => (
            <Badge key={g} variant="secondary">
              {g}
            </Badge>
          ))}
        </div>
      )}
      <ul className="flex flex-col divide-y rounded-xl border bg-card">
        {composer.works.map((w) => (
          <li key={w.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
            <span className="min-w-0 break-words text-sm font-medium">{w.title}</span>
            <span className="text-xs text-muted-foreground">
              {t("workMeta", { year: w.year, genre: w.genre })}
              {w.durationMin ? ` · ${t("minutes", { count: w.durationMin })}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
