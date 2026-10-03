"use client";

import { useState } from "react";
import { Play, VideoOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { youtubeEmbedUrl } from "@/lib/media";
import type { MediaItem } from "@/types/media";
import { MediaCard } from "./media-card";

/** YouTube iframe bosilgunga qadar yuklanmaydi: sahifa ochilganda uchinchi tomonga so'rov ketmaydi */
export function VideoPlayer({ item }: { item: MediaItem }) {
  const t = useTranslations("media");
  const [playing, setPlaying] = useState(false);
  const embed = item.youtubeId ? youtubeEmbedUrl(item.youtubeId) : null;
  const isFile = !item.youtubeId && item.url !== "";

  return (
    <MediaCard item={item}>
      <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
        {isFile ? (
          <video controls preload="none" src={item.url} className="size-full" aria-label={item.title} />
        ) : !embed ? (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <VideoOff className="size-6" aria-hidden />
            {t("videoUnavailable")}
          </div>
        ) : playing ? (
          <iframe
            src={embed}
            title={item.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            className="size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`${t("play")}: ${item.title}`}
            className="group flex size-full items-center justify-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
              <Play className="size-6 translate-x-0.5" aria-hidden />
            </span>
          </button>
        )}
      </div>
    </MediaCard>
  );
}
