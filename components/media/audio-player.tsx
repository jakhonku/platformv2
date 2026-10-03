import { useTranslations } from "next-intl";
import type { MediaItem } from "@/types/media";
import { MediaCard } from "./media-card";

export function AudioPlayer({ item }: { item: MediaItem }) {
  const t = useTranslations("media");
  return (
    <MediaCard item={item}>
      <audio controls preload="none" src={item.url} aria-label={`${t("play")}: ${item.title}`} className="w-full" />
    </MediaCard>
  );
}
