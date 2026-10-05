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
  weeklyViews: { week: string; views: number }[];
  /** Cholg'u asboblari bo'yicha (bir iqtidor bir nechta cholg'uda hisoblanadi) */
  talentsByInstrument: { instrumentId: string; count: number }[];
  talentsByVoice: { voiceTypeId: string; count: number }[];
  /** Yosh guruhlari: `unknown` — tug'ilgan yil ko'rsatilmagan */
  talentsByAge: { group: "under18" | "18_24" | "25_34" | "35_44" | "45_54" | "55plus" | "unknown"; count: number }[];
  talentsByExperience: { group: "0_2" | "3_5" | "6_10" | "11_20" | "21plus"; count: number }[];
  talentsByAvailability: { availability: "available" | "open_to_offers" | "busy"; count: number }[];
  /** Hisoblar: OneID orqali tasdiqlangan va tasdiqlanmagan */
  accounts: { verified: number; unverified: number };
  collectivesByType: { type: "orchestra" | "choir"; count: number }[];
  organizationsByKind: { kind: string; count: number }[];
  openings: { castingsOpen: number; castingsClosed: number; vacanciesOpen: number; vacanciesClosed: number };
  appealsByStatus: { status: "new" | "in_review" | "answered" | "returned" | "closed"; count: number }[];
  /** O'rtacha yosh va tajriba (yil) */
  averages: { age: number | null; experience: number };
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
