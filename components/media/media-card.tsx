import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { formatCount } from "@/lib/format";
import { formatDuration } from "@/lib/media";
import type { MediaItem } from "@/types/media";

/** Barcha pleyerlar uchun yagona karkas: sarlavha, tavsif, davomiylik va ko'rishlar */
export function MediaCard({ item, children }: { item: MediaItem; children: React.ReactNode }) {
  const t = useTranslations("media");
  const duration = formatDuration(item.durationSec);

  return (
    <Card className="gap-3 p-4">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold">{item.title}</h3>
        {item.description && <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
      </div>
      {children}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {duration && <span>{duration}</span>}
        <span className="inline-flex items-center gap-1">
          <Eye className="size-3.5" aria-hidden />
          {t("views", { count: item.views, formatted: formatCount(item.views) })}
        </span>
      </div>
    </Card>
  );
}
