import type { IsoDate } from "./common.ts";
import type { TalentKind } from "./talent.ts";

export type OpportunityStatus = "open" | "closed";

export type Requirements = {
  kinds?: TalentKind[];
  instrumentIds?: string[];
  voiceTypeIds?: string[];
  regionIds?: string[];
  minExperience?: number;
};

export type Casting = {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  requirements: Requirements;
  location: string;
  eventDate: IsoDate;
  deadline: IsoDate;
  status: OpportunityStatus;
  createdAt: IsoDate;
};

export type EmploymentType = "full_time" | "part_time" | "contract";

export type Vacancy = {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  requirements: Requirements;
  employment: EmploymentType;
  regionId: string;
  city: string;
  salaryFromUzs?: number;
  salaryToUzs?: number;
  deadline: IsoDate;
  status: OpportunityStatus;
  createdAt: IsoDate;
};

export type ApplicationStatus =
  | "submitted"
  | "viewed"
  | "shortlisted"
  | "invited"
  | "rejected"
  | "accepted";

export type ApplicationHistoryEntry = {
  status: ApplicationStatus;
  at: IsoDate;
  note?: string;
};

/** castingId yoki vakansiyaId'dan aynan bittasi to'ldiriladi */
export type Application = {
  id: string;
  castingId?: string;
  vacancyId?: string;
  talentId: string;
  message: string;
  mediaIds: string[];
  status: ApplicationStatus;
  history: ApplicationHistoryEntry[];
  createdAt: IsoDate;
};

export type ApplicationPayload = {
  talentId: string;
  message?: string;
  mediaIds?: string[];
};
