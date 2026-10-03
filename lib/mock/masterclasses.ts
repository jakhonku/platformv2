import type { MasterClass } from "../../types/content.ts";
import { instrumentById } from "../constants/index.ts";
import { iso } from "./now.ts";
import { slugify } from "./names.ts";
import { createRng } from "./random.ts";
import { TALENTS } from "./talents.ts";

const rng = createRng(2468);
const teachers = TALENTS.filter((t) => t.moderation === "approved" && t.verified && t.kind !== "composer");

export const MASTERCLASSES: MasterClass[] = Array.from({ length: 6 }, (_, i) => {
  const teacher = teachers[i % teachers.length];
  const instrumentId = teacher.instrumentIds[0];
  const instrument = instrumentId ? instrumentById(instrumentId) : undefined;
  const subject = teacher.kind === "vocalist" ? "Vokal mahorati" : teacher.kind === "conductor" ? "Dirijyorlik asoslari" : `${instrument?.name.uz ?? "Cholgʻu"} ijrochiligi`;
  const title = `${subject}: ${teacher.fullName} bilan mahorat darsi`;
  return {
    id: `masterclass-${i + 1}`,
    slug: slugify(title),
    title,
    description: `${subject} boʻyicha amaliy mahorat darsi. Ishtirokchilar oʻz ijrolarini namoyish etib, ustozdan bevosita fikr-mulohaza oladi.`,
    teacherId: teacher.id,
    instrumentId,
    date: iso(2026, 10 + (i % 3), 5 + i * 3, 11),
    durationHours: rng.int(2, 4),
    format: i % 2 === 0 ? "offline" : "online",
    priceUzs: rng.pick([0, 100_000, 150_000, 250_000]),
    seats: rng.int(10, 30),
    imageUrl: `/placeholders/cover-${(i % 6) + 1}.svg`,
  };
});
