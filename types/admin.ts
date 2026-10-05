import type { LocalizedText } from "./common.ts";
import type { ApplicationStatus } from "./opportunity.ts";
import type { InstrumentFamily } from "./reference.ts";
import type { TalentKind } from "./talent.ts";

export type Banner = { id: string; title: string; link: string; imageUrl: string; active: boolean };

export type SystemSettings = {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  moderationRequired: boolean;
  supportEmail: string;
};

export type SystemInfo = { users: number; talents: number; media: number; lastBackupAt: string | null; version: string };

export type ReferenceKind = "instrument" | "voiceType" | "region" | "category";

export type AdminStatistics = {
  talentsByKind: { kind: TalentKind; count: number }[];
  applicationsByStatus: { status: ApplicationStatus; count: number }[];
  topRegions: { regionId: string; count: number }[];
  monthlyViews: { month: string; views: number }[];
};

/** `saveReference` uchun kirish: `id` bo'lsa yangilash, aks holda yaratish */
export type ReferenceInput = {
  id?: string;
  name: LocalizedText;
  family?: InstrumentFamily;
  range?: { low: string; high: string };
  cities?: string[];
  kind?: "talent" | "news" | "event";
};
