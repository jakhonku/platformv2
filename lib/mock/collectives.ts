import type { Collective, CollectiveMember, CollectiveType } from "../../types/collective.ts";
import type { TalentProfile } from "../../types/talent.ts";
import { instrumentById, REGIONS } from "../constants/index.ts";
import { CHOIR_IDS, ORCHESTRA_IDS } from "./ids.ts";
import { phone, slugify } from "./names.ts";
import { createRng } from "./random.ts";
import { CONDUCTORS, TALENTS } from "./talents.ts";

type Seed = { name: string; regionId: string; city: string };

const ORCHESTRA_SEEDS: Seed[] = [
  { name: "Oʻzbekiston davlat simfonik orkestri", regionId: "tashkent-city", city: "Toshkent" },
  { name: "Toshkent kamera orkestri", regionId: "tashkent-city", city: "Toshkent" },
  { name: "Samarqand simfonik orkestri", regionId: "samarkand", city: "Samarqand" },
  { name: "Buxoro xalq cholgʻulari orkestri", regionId: "bukhara", city: "Buxoro" },
  { name: "Fargʻona estrada-simfonik orkestri", regionId: "fergana", city: "Fargʻona" },
  { name: "Xorazm maqom orkestri", regionId: "khorezm", city: "Urganch" },
  { name: "Navoiy yoshlar orkestri", regionId: "navoi", city: "Navoiy" },
  { name: "Respublika jazz-orkestri", regionId: "tashkent-city", city: "Toshkent" },
];

const CHOIR_SEEDS: Seed[] = [
  { name: "Oʻzbekiston davlat akademik xori", regionId: "tashkent-city", city: "Toshkent" },
  { name: "Toshkent yoshlar xori", regionId: "tashkent-city", city: "Toshkent" },
  { name: "Samarqand kamera xori", regionId: "samarkand", city: "Samarqand" },
  { name: "Andijon bolalar xori", regionId: "andijan", city: "Andijon" },
  { name: "Xorazm xalq xori", regionId: "khorezm", city: "Urganch" },
  { name: "Qoraqalpogʻiston davlat xori", regionId: "karakalpakstan", city: "Nukus" },
];

const ORCHESTRA_REPERTOIRE = [
  "Betxoven — 5-simfoniya",
  "Chaykovskiy — «Shelkunchik» syuitasi",
  "Motsart — 40-simfoniya",
  "Vivaldi — «Fasllar»",
  "Oʻzbek kompozitorlari asarlaridan syuita",
  "«Segoh» maqomi (orkestr talqini)",
];
const CHOIR_REPERTOIRE = [
  "Motsart — Rekviyem",
  "Shubert — «Ave Maria»",
  "Verdi — Xor «Nabukko»dan",
  "Oʻzbek xalq qoʻshiqlari turkumi",
  "«Navo» maqomi (xor talqini)",
  "Bolalar xori uchun qoʻshiqlar",
];
const EVENT_TITLES = ["Bahor konserti", "Gala-konsert", "Yoshlar kechasi", "Maqom oqshomi", "Yangi yil konserti", "Mustaqillik bayrami konserti"];
const VENUES = ["Katta konsert zali", "Filarmoniya zali", "Kamera zali", "Madaniyat saroyi"];

const rng = createRng(777);

function sectionOf(t: TalentProfile): string {
  if (t.kind === "vocalist") {
    return t.voiceTypeId ? t.voiceTypeId.charAt(0).toUpperCase() + t.voiceTypeId.slice(1) : "Xor";
  }
  const first = t.instrumentIds[0] ? instrumentById(t.instrumentIds[0]) : undefined;
  return first ? first.name.uz : "Orkestr";
}

function make(type: CollectiveType, seed: Seed, idx: number, ids: string[], globalIndex: number): Collective {
  const id = ids[idx];
  const region = REGIONS.find((r) => r.id === seed.regionId)!;
  const members: CollectiveMember[] = TALENTS.filter(
    (t) => t.currentCollectiveId === id && t.kind !== "conductor",
  ).map((t) => ({ talentId: t.id, section: sectionOf(t) }));
  const conductor = CONDUCTORS[globalIndex % CONDUCTORS.length];

  return {
    id,
    slug: slugify(seed.name),
    type,
    name: seed.name,
    logoUrl: `/placeholders/logo-${(globalIndex % 6) + 1}.svg`,
    regionId: seed.regionId,
    city: seed.city && region.cities.includes(seed.city) ? seed.city : region.cities[0],
    foundedYear: rng.int(1930, 2015),
    description: `${seed.name} — ${seed.city}dagi ${type === "orchestra" ? "orkestr" : "xor"} jamoasi. Jamoa har yili respublika va xalqaro sahnalarda konsertlar beradi.`,
    conductorId: conductor.id,
    members,
    repertoire: rng.shuffle(type === "orchestra" ? ORCHESTRA_REPERTOIRE : CHOIR_REPERTOIRE).slice(0, 4),
    events: Array.from({ length: rng.int(2, 3) }, (_, k) => ({
      id: `${id}-event-${k + 1}`,
      title: EVENT_TITLES[(globalIndex + k) % EVENT_TITLES.length],
      date: new Date(Date.UTC(2026, 9 + k * 2, rng.int(1, 28), 18, 0)).toISOString(),
      venue: rng.pick(VENUES),
    })),
    verified: rng.chance(0.7),
    moderation: "approved",
    contacts: {
      phone: phone(rng.int(0, 9), rng.int(100, 999), rng.int(10, 99), rng.int(10, 99)),
      email: `${slugify(seed.name).slice(0, 24)}@example.uz`,
    },
  };
}

export const ORCHESTRAS: Collective[] = ORCHESTRA_SEEDS.map((s, i) => make("orchestra", s, i, ORCHESTRA_IDS, i));
export const CHOIRS: Collective[] = CHOIR_SEEDS.map((s, i) => make("choir", s, i, CHOIR_IDS, ORCHESTRA_IDS.length + i));
