import type { MediaItem } from "../types/media.ts";

const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,20}$/;

export function youtubeEmbedUrl(id: string): string | null {
  return YOUTUBE_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
}

export function youtubeThumbUrl(id: string): string | null {
  return YOUTUBE_ID.test(id) ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function formatDuration(sec: number | undefined): string {
  if (sec === undefined || !Number.isFinite(sec) || sec < 0) return "";
  const total = Math.floor(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

export function groupMedia(items: MediaItem[]): { video: MediaItem[]; audio: MediaItem[]; documents: MediaItem[] } {
  return {
    video: items.filter((m) => m.type === "video"),
    audio: items.filter((m) => m.type === "audio"),
    documents: items.filter((m) => m.type === "document" || m.type === "score" || m.type === "midi"),
  };
}
