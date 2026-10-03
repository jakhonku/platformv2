import type { Application, ApplicationHistoryEntry, ApplicationStatus } from "../../types/opportunity.ts";
import { CASTINGS } from "./castings.ts";
import { createRng } from "./random.ts";
import { TALENTS } from "./talents.ts";
import { VACANCIES } from "./vacancies.ts";

const rng = createRng(5150);

const FORWARD: ApplicationStatus[] = ["submitted", "viewed", "shortlisted", "invited", "accepted"];
const MESSAGES = [
  "Assalomu alaykum! Kastingda ishtirok etishni xohlayman. Portfolio materiallarim ilova qilingan.",
  "Ushbu imkoniyat mening mutaxassisligimga mos keladi. Suhbatga tayyorman.",
  "Tajribam va repertuarim talablarga javob beradi deb hisoblayman.",
  "Jamoaga qoʻshilish va ijodiy hissa qoʻshish istagidaman.",
];

function historyFor(status: ApplicationStatus, createdAt: string): ApplicationHistoryEntry[] {
  const steps: ApplicationStatus[] =
    status === "rejected" ? ["submitted", "viewed", "rejected"] : FORWARD.slice(0, FORWARD.indexOf(status) + 1);
  const start = Date.parse(createdAt);
  return steps.map((s, k) => ({ status: s, at: new Date(start + k * 86400000 * 2).toISOString() }));
}

const approvedTalents = TALENTS.filter((t) => t.moderation === "approved");
const targets: { castingId?: string; vacancyId?: string }[] = [
  ...CASTINGS.map((c) => ({ castingId: c.id })),
  ...VACANCIES.map((v) => ({ vacancyId: v.id })),
];

// Birinchi 6 ta ariza har xil holatda bo'lishi uchun ro'yxat tartibi qat'iy
const STATUS_PLAN: ApplicationStatus[] = [
  "submitted", "viewed", "shortlisted", "invited", "rejected", "accepted",
  ...Array.from({ length: 22 }, () => rng.pick<ApplicationStatus>(["submitted", "viewed", "shortlisted", "invited", "rejected", "accepted"])),
];

const pairs = new Set<string>();
export const APPLICATIONS: Application[] = [];

for (const status of STATUS_PLAN) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const talent = rng.pick(approvedTalents);
    const target = rng.pick(targets);
    const key = `${talent.id}|${target.castingId ?? target.vacancyId}`;
    if (pairs.has(key)) continue;
    pairs.add(key);
    const createdAt = new Date(Date.UTC(2026, 7, rng.int(1, 28), 10, 0)).toISOString();
    APPLICATIONS.push({
      id: `application-${String(APPLICATIONS.length + 1).padStart(2, "0")}`,
      ...target,
      talentId: talent.id,
      message: rng.pick(MESSAGES),
      mediaIds: [],
      status,
      history: historyFor(status, createdAt),
      createdAt,
    });
    break;
  }
}
