import type { Collective, Organization } from "../../types/collective.ts";
import type { Application, Casting, Vacancy } from "../../types/opportunity.ts";
import type { TalentProfile } from "../../types/talent.ts";
import type { MediaItem } from "../../types/media.ts";
import type { ModerationStatus } from "../../types/common.ts";
import type { ReviewState } from "../../types/review.ts";
import type { MissingField } from "../review.ts";

export type CastingItem = Casting & { organizationName: string; applicantsCount: number };
export type CastingDetail = CastingItem & { organization: Organization | null };

export type VacancyItem = Vacancy & { organizationName: string; applicantsCount: number };
export type VacancyDetail = VacancyItem & { organization: Organization | null };

export type CollectiveDetail = Collective & {
  conductor: TalentProfile | null;
  memberProfiles: TalentProfile[];
};

export type OrganizationDetail = Organization & { castings: Casting[]; vacancies: Vacancy[] };

export type ApplicationView = Application & {
  targetKind: "casting" | "vacancy";
  title: string;
  organizationName: string;
};

export type ApplicantView = Application & { talent: TalentProfile | null };

export type ModerationKind = "profile" | "media" | "organization" | "collective";

export type ModerationItem = {
  id: string;
  kind: ModerationKind;
  title: string;
  subtitle: string;
  status: ModerationStatus;
  submittedAt: string;
  payload: TalentProfile | MediaItem | Organization | Collective;
  meta?: ModerationMeta;
  /** Faqat profil/tashkilot/jamoa arizalari uchun */
  review?: ReviewState;
  completeness?: { missing: MissingField[]; percent: number };
  phone?: string;
  counts?: { members?: number; unregistered?: number; staff?: number };
};

/** Moderator uchun qo`shimcha: shaxs qanday aniqlangan, STIR va hujjatlar */
export type ModerationMeta = {
  identity?: "oneid" | "manual";
  identityType?: "individual" | "legal";
  stir?: string;
  documents?: string[];
  owner?: string;
};
