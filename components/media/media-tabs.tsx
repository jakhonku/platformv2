"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/layout/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { groupMedia } from "@/lib/media";
import type { MediaItem } from "@/types/media";
import { AudioPlayer } from "./audio-player";
import { DocumentItem } from "./document-item";
import { VideoPlayer } from "./video-player";

type TabKey = "video" | "audio" | "documents";

export function MediaTabs({ items }: { items: MediaItem[] }) {
  const t = useTranslations("media");
  const groups = groupMedia(items);
  const keys: TabKey[] = ["video", "audio", "documents"];
  const first = keys.find((k) => groups[k].length > 0);

  if (!first) return <EmptyState title={t("empty")} text={t("emptyText")} />;

  return (
    <Tabs defaultValue={first}>
      <div className="max-w-full overflow-x-auto">
        <TabsList>
          {keys.map((k) => (
            <TabsTrigger key={k} value={k} className="px-3">
              {t(`tabs.${k}`)} ({groups[k].length})
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {keys.map((k) => (
        <TabsContent key={k} value={k}>
          {groups[k].length === 0 ? (
            <EmptyState title={t("empty")} />
          ) : (
            <div className={k === "documents" ? "flex flex-col gap-3" : "grid gap-4 sm:grid-cols-2"}>
              {k === "video" && groups.video.map((m) => <VideoPlayer key={m.id} item={m} />)}
              {k === "audio" && groups.audio.map((m) => <AudioPlayer key={m.id} item={m} />)}
              {k === "documents" && groups.documents.map((m) => <DocumentItem key={m.id} item={m} />)}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
