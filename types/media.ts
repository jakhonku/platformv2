import type { IsoDate, ModerationStatus } from "./common.ts";

export type MediaType = "video" | "audio" | "document" | "score" | "midi";

export type MediaItem = {
  id: string;
  ownerId: string;
  ownerType: "talent" | "collective";
  type: MediaType;
  title: string;
  description: string;
  /** YouTube havolasi yoki fayl URL'i */
  url: string;
  youtubeId?: string;
  durationSec?: number;
  moderation: ModerationStatus;
  views: number;
  createdAt: IsoDate;
};

export type Collection = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  itemIds: string[];
};
