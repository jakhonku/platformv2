import type { Availability, Contacts, IsoDate, ModerationStatus } from "./common.ts";

export type TalentKind = "musician" | "vocalist" | "conductor" | "composer";

export type EducationEntry = {
  institution: string;
  degree: string;
  yearFrom: number;
  yearTo?: number;
};

export type ExperienceEntry = {
  organization: string;
  position: string;
  yearFrom: number;
  yearTo?: number;
};

export type TalentProfile = {
  id: string;
  userId: string;
  slug: string;
  kind: TalentKind;
  fullName: string;
  photoUrl: string;
  /** Qisqa mutaxassislik sarlavhasi, masalan "Skripkachi, solist" */
  specialty: string;
  bio: string;
  regionId: string;
  city: string;
  instrumentIds: string[];
  voiceTypeId?: string;
  voiceRange?: { low: string; high: string };
  education: EducationEntry[];
  experience: ExperienceEntry[];
  experienceYears: number;
  currentCollectiveId?: string;
  repertoire: string[];
  availability: Availability;
  verified: boolean;
  featured: boolean;
  moderation: ModerationStatus;
  contacts: Contacts;
  createdAt: IsoDate;
  moderationNote?: string;
};

export type ComposedWork = {
  id: string;
  title: string;
  year: number;
  genre: string;
  durationMin?: number;
};

export type ConductorProfile = TalentProfile & {
  kind: "conductor";
  ensembleTypes: ("orchestra" | "choir")[];
};

export type ComposerProfile = TalentProfile & {
  kind: "composer";
  genres: string[];
  works: ComposedWork[];
};
