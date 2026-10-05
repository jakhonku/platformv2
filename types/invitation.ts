import type { IsoDate } from "./common.ts";

export type Invitation = {
  id: string;
  talentId: string;
  senderName: string;
  contact: string;
  message: string;
  createdAt: IsoDate;
  /** Yo'q bo'lsa "new" deb hisoblanadi */
  status?: "new" | "accepted" | "declined";
};

export type InvitationPayload = { senderName: string; contact: string; message: string };
