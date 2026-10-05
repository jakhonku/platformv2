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
  ownerUserId?: string;
  documents?: string[];
  moderationNote?: string;
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
  stir?: string;
  ownerUserId?: string;
  documents?: string[];
  moderationNote?: string;
};

export type CollectiveInviteStatus = "pending" | "accepted" | "declined";

/** Jamoa a`zoligi ikki tomonlama: rahbar taklif qiladi, iqtidor qabul qiladi */
export type CollectiveInvite = {
  id: string;
  collectiveId: string;
  talentId: string;
  section: string;
  status: CollectiveInviteStatus;
  createdAt: IsoDate;
};
