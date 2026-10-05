import { Download, FileText, Music } from "@/components/icons";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import type { MediaItem } from "@/types/media";

export function DocumentItem({ item }: { item: MediaItem }) {
  const t = useTranslations("media");
  const Icon = item.type === "midi" ? Music : FileText;
  const type = item.type === "video" || item.type === "audio" ? "document" : item.type;

  return (
    <Card className="flex-row items-center gap-3 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{item.title}</h3>
        <p className="truncate text-xs text-muted-foreground">
          {t(`docType.${type}`)}
          {item.description ? ` · ${item.description}` : ""}
        </p>
      </div>
      <a
        href={item.url}
        download
        aria-label={`${t("download")}: ${item.title}`}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Download className="size-4" aria-hidden />
      </a>
    </Card>
  );
}
