import { AudioPlayer } from "@/components/media/audio-player";
import { DocumentItem } from "@/components/media/document-item";
import { VideoPlayer } from "@/components/media/video-player";
import type { MediaItem } from "@/types/media";

/** Moderatsiya uchun oldindan ko`rish: pleyerlar profil sahifasidagi bilan bir xil (ko`rishlar hisobiga qo`shilmaydi) */
export function MediaPreview({ item }: { item: MediaItem }) {
  if (item.type === "video") return <VideoPlayer item={item} />;
  if (item.type === "audio") return <AudioPlayer item={item} />;
  return <DocumentItem item={item} />;
}
