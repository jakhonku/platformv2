import type { Contacts, IsoDate, ModerationStatus } from "./common.ts";

export type CollectiveType = "orchestra" | "choir";

export type CollectiveMember = {
  talentId: string;
  /** Guruh/partiya, masalan "Birinchi skripkalar" yoki "Soprano" */
  section: string;
};

export type CollectiveEvent = {
  id: string;
  title: string;
  date: IsoDate;
  venue: string;
};

export type Collective = {
  id: string;
  slug: string;
  type: CollectiveType;
  name: string;
  logoUrl: string;
  regionId: string;
  city: string;
  foundedYear: number;
  description: string;
  conductorId?: string;
  members: CollectiveMember[];
  repertoire: string[];
  events: CollectiveEvent[];
  verified: boolean;
  moderation: ModerationStatus;
  contacts: Contacts;
};

export type OrganizationKind =
  | "philharmonic"
  | "theatre"
  | "conservatory"
  | "college"
  | "school"
  | "festival_org"
  | "agency";

export type Organization = {
  id: string;
  slug: string;
  name: string;
  kind: OrganizationKind;
  logoUrl: string;
  regionId: string;
  city: string;
  description: string;
  verification: ModerationStatus;
  contacts: Contacts;
  createdAt: IsoDate;
};
