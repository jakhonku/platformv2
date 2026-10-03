import type { IsoDate } from "./common.ts";

export type Invitation = {
  id: string;
  talentId: string;
  senderName: string;
  contact: string;
  message: string;
  createdAt: IsoDate;
};

export type InvitationPayload = { senderName: string; contact: string; message: string };
