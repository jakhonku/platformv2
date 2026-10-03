import type { IsoDate } from "./common.ts";

export type NotificationChannel = "internal" | "email" | "sms" | "telegram";

export type Notification = {
  id: string;
  userId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: IsoDate;
};

export type AuditLogEntry = {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  at: IsoDate;
};

export type AdminStats = {
  users: number;
  talents: number;
  collectives: number;
  organizations: number;
  castingsOpen: number;
  applications: number;
  pendingModeration: number;
  monthlyViews: { month: string; views: number }[];
};
