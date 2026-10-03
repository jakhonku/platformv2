import type { Collective, Organization } from "../../types/collective.ts";
import type { Application, Casting, Vacancy } from "../../types/opportunity.ts";
import type { TalentProfile } from "../../types/talent.ts";
import type { MediaItem } from "../../types/media.ts";
import type { ModerationStatus } from "../../types/common.ts";

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

export type ModerationKind = "profile" | "media" | "organization";

export type ModerationItem = {
  id: string;
  kind: ModerationKind;
  title: string;
  subtitle: string;
  status: ModerationStatus;
  submittedAt: string;
  payload: TalentProfile | MediaItem | Organization;
};
