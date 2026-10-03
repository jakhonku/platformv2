import { z } from "zod";
import type { Invitation, InvitationPayload } from "../../types/invitation.ts";
import { DataError } from "./errors.ts";
import { simulateLatency } from "./latency.ts";
import { store } from "./store.ts";
import { clone } from "./text.ts";

const payloadSchema = z.object({
  senderName: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(5).max(120),
  message: z.string().trim().min(10).max(1000),
});

export async function sendInvitation(talentId: string, payload: InvitationPayload): Promise<Invitation> {
  await simulateLatency();
  const talent = store.talents.find((t) => t.id === talentId && t.moderation === "approved");
  if (!talent) throw new DataError("not_found", "Profil topilmadi");
  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) throw new DataError("invalid", "Taklif maʼlumotlari notoʻgʻri");
  const invitation: Invitation = {
    id: `invitation-${String(store.invitations.length + 1).padStart(2, "0")}`,
    talentId,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };
  store.invitations.push(invitation);
  return clone(invitation);
}
