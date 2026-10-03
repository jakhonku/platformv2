import { INSTRUMENTS, REGIONS, VOICE_TYPES } from "../constants/index.ts";
import type { ComposerProfile, ConductorProfile, TalentKind, TalentProfile } from "../../types/talent.ts";
import { CHOIR_IDS, COLLECTIVE_IDS, ORCHESTRA_IDS } from "./ids.ts";
import { FEMALE_NAMES, femaleSurname, MALE_NAMES, phone, slugify, SURNAMES } from "./names.ts";
import { createRng, randomDate } from "./random.ts";

const CURRENT_YEAR = 2026;
const rng = createRng(20260101);

const KIND_PLAN: TalentKind[] = rng.shuffle([
  ...Array<TalentKind>(22).fill("musician"),
  ...Array<TalentKind>(11).fill("vocalist"),
  ...Array<TalentKind>(5).fill("conductor"),
  ...Array<TalentKind>(6).fill("composer"),
]);

const PENDING_AT = new Set([7, 19, 33]);
const REJECTED_AT = new Set([26]);

const INSTITUTIONS = [
  "Oʻzbekiston davlat konservatoriyasi",
  "Toshkent davlat madaniyat instituti",
  "Respublika musiqa akademik litseyi",
  "Samarqand davlat sanʼat va madaniyat instituti",
  "Toshkent musiqa kolleji",
  "Fargʻona davlat sanʼat kolleji",
];
const WORKPLACES = [
  "Oʻzbekiston davlat filarmoniyasi",
  "Toshkent kamera orkestri",
  "Sharq taronalari ansambli",
  "Navoiy nomidagi opera teatri",
  "Respublika yoshlar orkestri",
  "Samarqand viloyat filarmoniyasi",
  "Madaniyat va sanʼat markazi",
];
const POSITIONS: Record<TalentKind, string[]> = {
  musician: ["Orkestr artisti", "Solist", "Konsertmeyster", "Ansambl artisti"],
  vocalist: ["Solist", "Xor artisti", "Vokal oʻqituvchisi"],
  conductor: ["Dirijyor", "Bosh dirijyor", "Xormeyster"],
  composer: ["Kompozitor", "Aranjirovkachi", "Musiqiy rahbar"],
};
const REPERTOIRE: Record<TalentKind, string[]> = {
  musician: [
    "Chaykovskiy — Skripka kontserti",
    "Betxoven — 5-simfoniya",
    "Rahmaninov — 2-fortepiano kontserti",
    "Vivaldi — «Fasllar»",
    "Bax — Chakona",
    "Motsart — Klarnet kontserti",
    "«Segoh» maqomi",
    "«Dugoh Husayniy» maqomi",
    "«Chorgoh» maqomi",
  ],
  vocalist: [
    "Verdi — «La Traviata» ariyalari",
    "Puchchini — «Turandot» ariyalari",
    "Shubert — «Ave Maria»",
    "Motsart — Rekviyem",
    "Oʻzbek xalq qoʻshiqlari turkumi",
    "«Navo» maqomi",
    "Rahmaninov — Romanslar",
  ],
  conductor: [
    "Betxoven — 9-simfoniya",
    "Motsart — Rekviyem",
    "Chaykovskiy — «Shelkunchik» syuitasi",
    "Brams — 1-simfoniya",
    "Xor uchun oʻzbek xalq qoʻshiqlari",
  ],
  composer: ["Original simfonik asarlar", "Kamera ansambllari uchun pyesalar", "Xor uchun kantatalar", "Kinomusiqa"],
};
const COMPOSER_GENRES = [
  "Simfonik musiqa",
  "Kamera musiqasi",
  "Xor musiqasi",
  "Kinomusiqa",
  "Estrada",
  "Opera",
  "Xalq cholgʻulari uchun asarlar",
];
const WORK_TITLES = ["Bahor syuitasi", "Sharq raqslari", "Samarqand tasvirlari", "Qumsoat", "Nur sari", "Vatan kantatasi", "Kechki kuy"];

const MUSICIAN_SUFFIX = ["ijrochisi", "ijrochisi, solist", "ijrochisi, ansambl artisti", "ijrochisi, pedagog"];
const VOCAL_SUFFIX = ["opera vokalchisi", "kamera vokalchisi", "xor solisti", "estrada vokalchisi"];
const CONDUCTOR_TITLES = ["Simfonik orkestr dirijyori", "Xor dirijyori", "Kamera orkestri dirijyori"];
const COMPOSER_TITLES = ["Kompozitor", "Kompozitor va aranjirovkachi", "Kinomusiqa kompozitori"];

const usedNames = new Set<string>();
const usedSlugs = new Set<string>();
let vocalIndex = 0;
let conductorIndex = 0;
let musicianIndex = 0;

function uniqueSlug(base: string): string {
  let slug = base;
  for (let n = 2; usedSlugs.has(slug); n++) slug = `${base}-${n}`;
  usedSlugs.add(slug);
  return slug;
}

function makeName(female: boolean): string {
  for (;;) {
    const given = rng.pick(female ? FEMALE_NAMES : MALE_NAMES);
    const surname = rng.pick(SURNAMES);
    const full = `${given} ${female ? femaleSurname(surname) : surname}`;
    if (!usedNames.has(full)) {
      usedNames.add(full);
      return full;
    }
  }
}

function build(kind: TalentKind, i: number): TalentProfile | ConductorProfile | ComposerProfile {
  const num = String(i + 1).padStart(2, "0");
  const voiceIdx = kind === "vocalist" ? vocalIndex++ % VOICE_TYPES.length : -1;
  const female = kind === "vocalist" ? voiceIdx < 3 : rng.chance(0.5);
  const fullName = makeName(female);
  const slug = uniqueSlug(slugify(fullName));
  const region = rng.pick(REGIONS);
  const city = rng.pick(region.cities);
  const experienceYears = rng.int(2, 30);

  let instrumentIds: string[] = [];
  let specialty = "";
  let currentCollectiveId: string | undefined;
  let voice: (typeof VOICE_TYPES)[number] | undefined;
  let conductorNo = -1;

  if (kind === "musician") {
    const first = rng.pick(INSTRUMENTS);
    instrumentIds = [first.id];
    if (rng.chance(0.4)) {
      const second = rng.pick(INSTRUMENTS.filter((x) => x.family === first.family && x.id !== first.id));
      instrumentIds.push(second.id);
    }
    specialty = `${first.name.uz} ${rng.pick(MUSICIAN_SUFFIX)}`;
    const k = musicianIndex++;
    currentCollectiveId = k < ORCHESTRA_IDS.length ? ORCHESTRA_IDS[k] : rng.chance(0.55) ? rng.pick(ORCHESTRA_IDS) : undefined;
  } else if (kind === "vocalist") {
    voice = VOICE_TYPES[voiceIdx];
    instrumentIds = rng.chance(0.4) ? ["piano"] : [];
    specialty = `${voice.name.uz}, ${rng.pick(VOCAL_SUFFIX)}`;
    currentCollectiveId = voiceIdx >= 0 && vocalIndex <= CHOIR_IDS.length ? CHOIR_IDS[vocalIndex - 1] : rng.chance(0.7) ? rng.pick(CHOIR_IDS) : undefined;
  } else if (kind === "conductor") {
    conductorNo = conductorIndex++;
    instrumentIds = ["piano"];
    specialty = rng.pick(CONDUCTOR_TITLES);
    currentCollectiveId = COLLECTIVE_IDS[conductorNo];
  } else {
    instrumentIds = rng.chance(0.6) ? ["piano"] : ["piano", rng.pick(INSTRUMENTS).id].filter((v, k, a) => a.indexOf(v) === k);
    specialty = rng.pick(COMPOSER_TITLES);
  }

  const moderation = PENDING_AT.has(i) ? "pending" : REJECTED_AT.has(i) ? "rejected" : "approved";
  const verified = moderation === "approved" && rng.chance(0.6);

  const base: TalentProfile = {
    id: `talent-${num}`,
    userId: `user-talent-${num}`,
    slug,
    kind,
    fullName,
    photoUrl: `/placeholders/avatar-${(i % 8) + 1}.svg`,
    specialty,
    bio: `${fullName} — ${city}lik ${specialty.charAt(0).toLowerCase()}${specialty.slice(1)}. ${experienceYears} yillik ijodiy tajribaga ega, respublika va xalqaro sahnalarda chiqish qilgan.`,
    regionId: region.id,
    city,
    instrumentIds,
    voiceTypeId: voice?.id,
    voiceRange: voice ? { ...voice.range } : undefined,
    education: Array.from({ length: rng.int(1, 2) }, (_, k) => ({
      institution: rng.pick(INSTITUTIONS),
      degree: k === 0 ? rng.pick(["Bakalavr", "Akademik litsey"]) : "Magistr",
      yearFrom: CURRENT_YEAR - experienceYears - 6 + k * 4,
      yearTo: CURRENT_YEAR - experienceYears - 2 + k * 4,
    })),
    experience: Array.from({ length: rng.int(1, 3) }, (_, k) => ({
      organization: rng.pick(WORKPLACES),
      position: rng.pick(POSITIONS[kind]),
      yearFrom: CURRENT_YEAR - experienceYears + k * 3,
      yearTo: k === 0 ? undefined : CURRENT_YEAR - experienceYears + k * 3 + 2,
    })),
    experienceYears,
    currentCollectiveId,
    repertoire: rng.shuffle(REPERTOIRE[kind]).slice(0, rng.int(3, 5)),
    availability: rng.pick(["available", "available", "available", "open_to_offers", "open_to_offers", "busy"] as const),
    verified,
    featured: false,
    moderation,
    contacts: {
      phone: phone(rng.int(0, 9), rng.int(100, 999), rng.int(10, 99), rng.int(10, 99)),
      email: `${slug}@example.uz`,
      telegram: `@${slug.replace(/-/g, "_")}`,
    },
    createdAt: randomDate(rng),
  };

  if (kind === "conductor") {
    const leads = [conductorNo, conductorNo + 5, conductorNo + 10].filter((k) => k < COLLECTIVE_IDS.length);
    const ensembleTypes = Array.from(new Set(leads.map((k) => (k < ORCHESTRA_IDS.length ? "orchestra" : "choir")))) as ConductorProfile["ensembleTypes"];
    return { ...base, kind, ensembleTypes };
  }
  if (kind === "composer") {
    return {
      ...base,
      kind,
      genres: rng.shuffle(COMPOSER_GENRES).slice(0, 2),
      works: Array.from({ length: rng.int(3, 5) }, (_, k) => ({
        id: `work-${num}-${k + 1}`,
        title: WORK_TITLES[(i + k) % WORK_TITLES.length],
        year: rng.int(2005, 2025),
        genre: rng.pick(COMPOSER_GENRES),
        durationMin: rng.int(5, 40),
      })),
    };
  }
  return base;
}

const built = KIND_PLAN.map((kind, i) => build(kind, i));

// Eng yaxshi 8 ta tasdiqlangan profil "tanlangan" deb belgilanadi
let featuredLeft = 8;
export const TALENTS: TalentProfile[] = built.map((t) => {
  if (featuredLeft > 0 && t.moderation === "approved" && t.verified) {
    featuredLeft--;
    return { ...t, featured: true };
  }
  return t;
});

/** Dirijyor tartib raqami (0..4): kollektivlarni bog'lash uchun */
export const CONDUCTORS: ConductorProfile[] = TALENTS.filter((t): t is ConductorProfile => t.kind === "conductor");
