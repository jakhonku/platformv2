import type { IsoDate } from "./common.ts";

export type EventStatus = "upcoming" | "ongoing" | "finished";

type EventBase = {
  id: string;
  slug: string;
  title: string;
  description: string;
  regionId: string;
  city: string;
  startDate: IsoDate;
  endDate: IsoDate;
  imageUrl: string;
  organizerId?: string;
  status: EventStatus;
};

export type Competition = EventBase & {
  deadline: IsoDate;
  prizeFundUzs?: number;
  categoryId: string;
};

export type Festival = EventBase & {
  lineup: string[];
};

export type ProjectStatus = "planned" | "active" | "completed";

export type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: ProjectStatus;
  startDate: IsoDate;
  endDate?: IsoDate;
  organizationId?: string;
  collectiveIds: string[];
  talentIds: string[];
  imageUrl: string;
};

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  categoryId: string;
  authorId: string;
  imageUrl: string;
  publishedAt: IsoDate;
};

export type MasterClassFormat = "online" | "offline";

export type MasterClass = {
  id: string;
  slug: string;
  title: string;
  description: string;
  teacherId: string;
  instrumentId?: string;
  date: IsoDate;
  durationHours: number;
  format: MasterClassFormat;
  priceUzs: number;
  seats: number;
  imageUrl: string;
};
