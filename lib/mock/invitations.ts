import type { Invitation } from "../../types/invitation.ts";
import { iso } from "./now.ts";
import { ORGANIZATIONS } from "./organizations.ts";
import { TALENTS } from "./talents.ts";

const targets = TALENTS.filter((t) => t.moderation === "approved" && t.verified);

const MESSAGES = [
  "Sizni kelasi mavsumdagi konsert dasturimizda ishtirok etishga taklif qilamiz. Batafsil suhbatlashishga tayyormiz.",
  "Portfolioingiz juda yoqdi. Jamoamiz bilan sinov repetitsiyasiga kelishingiz mumkinmi?",
  "Festival gala-konserti uchun solist qidiryapmiz. Sizning ijroingiz bizga mos keladi.",
  "Mahorat darsi doirasida ustoz sifatida qatnashishni taklif qilamiz. Shartlarni muhokama qilamiz.",
];

export const INVITATIONS: Invitation[] = MESSAGES.map((message, i) => {
  const org = ORGANIZATIONS[i % ORGANIZATIONS.length];
  return {
    id: `invitation-seed-${i + 1}`,
    talentId: targets[i % targets.length].id,
    senderName: org.name,
    contact: org.contacts.email ?? `org${i + 1}@example.uz`,
    message,
    createdAt: iso(2026, 9, 20 + i, 10),
    status: "new",
  };
});
