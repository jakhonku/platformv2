import type { Collection, MediaItem } from "../../types/media.ts";
import { simulateLatency } from "./latency.ts";
import { store } from "./store.ts";
import { clone } from "./text.ts";

/** Standart holatda faqat tasdiqlangan materiallar (ommaviy profil). Kabinet uchun includeAll. */
export async function getMediaForOwner(ownerId: string, opts: { includeAll?: boolean } = {}): Promise<MediaItem[]> {
  await simulateLatency();
  return clone(store.media.filter((m) => m.ownerId === ownerId && (opts.includeAll || m.moderation === "approved")));
}

export async function getMediaById(id: string): Promise<MediaItem | null> {
  await simulateLatency();
  const found = store.media.find((m) => m.id === id);
  return found ? clone(found) : null;
}

export async function getCollectionsForOwner(ownerId: string): Promise<Collection[]> {
  await simulateLatency();
  return clone(store.collections.filter((c) => c.ownerId === ownerId));
}
