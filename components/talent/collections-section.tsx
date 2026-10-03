import { FolderOpen } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/layout/empty-state";
import { Card } from "@/components/ui/card";
import type { Collection } from "@/types/media";

export async function CollectionsList({ promise }: { promise: Promise<Collection[]> }) {
  const [t, collections] = await Promise.all([getTranslations("profile"), promise]);
  if (collections.length === 0) return <EmptyState title={t("noCollections")} />;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {collections.map((c) => (
        <Card key={c.id} className="flex-row items-start gap-3 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FolderOpen className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{c.title}</h3>
            {c.description && <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
            <p className="mt-1 text-xs text-muted-foreground">{t("itemsCount", { count: c.itemIds.length })}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
