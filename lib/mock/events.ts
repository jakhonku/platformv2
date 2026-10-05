import type { Competition, EventStatus, Festival } from "../../types/content.ts";
import { REGIONS } from "../constants/index.ts";
import { iso, MOCK_NOW } from "./now.ts";
import { slugify } from "./names.ts";

type Seed = {
  title: string;
  description: string;
  region: string;
  start: [number, number, number];
  end: [number, number, number];
  organizer?: number;
};

const statusOf = (start: string, end: string): EventStatus => (end < MOCK_NOW ? "finished" : start > MOCK_NOW ? "upcoming" : "ongoing");
const orgId = (n?: number) => (n ? `org-${String(n).padStart(2, "0")}` : undefined);

const COMPETITION_SEEDS: (Seed & { deadline: [number, number, number]; prizeMln: number })[] = [
  { title: "Respublika yosh skripkachilar tanlovi", description: "18 yoshgacha boʻlgan skripkachilar uchun ikki bosqichli respublika tanlovi. Gʻoliblarga pul mukofotlari va konsert ishtiroki taqdim etiladi.", region: "tashkent-city", start: [2026, 11, 20], end: [2026, 11, 23], organizer: 2, deadline: [2026, 11, 1], prizeMln: 30 },
  { title: "«Oltin ovoz» vokalistlar tanlovi", description: "Akademik va estrada yoʻnalishlari boʻyicha vokalistlar tanlovi. Yakuniy gala-konsert ommaviy tomoshabinlar uchun ochiq.", region: "samarkand", start: [2026, 12, 12], end: [2026, 12, 14], organizer: 3, deadline: [2026, 11, 20], prizeMln: 50 },
  { title: "Maqom ijrochilari tanlovi", description: "Shashmaqom va xorazm maqomlari ijrochilari uchun anʼanaviy tanlov. Ijrochilik mahorati va ustoz-shogird anʼanasi baholanadi.", region: "bukhara", start: [2026, 9, 5], end: [2026, 9, 8], organizer: 4, deadline: [2026, 8, 20], prizeMln: 25 },
  { title: "Yosh kompozitorlar tanlovi", description: "35 yoshgacha boʻlgan kompozitorlarning original asarlari tanlovi. Eng yaxshi asarlar simfonik orkestr ijrosida yangraydi.", region: "tashkent-city", start: [2027, 2, 10], end: [2027, 2, 12], organizer: 1, deadline: [2027, 1, 15], prizeMln: 40 },
];

export const COMPETITIONS: Competition[] = COMPETITION_SEEDS.map((s, i) => {
  const region = REGIONS.find((r) => r.id === s.region)!;
  const startDate = iso(...s.start, 10);
  const endDate = iso(...s.end, 20);
  return {
    id: `competition-${i + 1}`,
    slug: slugify(s.title),
    title: s.title,
    description: s.description,
    regionId: s.region,
    city: region.cities[0],
    startDate,
    endDate,
    imageUrl: `/placeholders/cover-${(i % 6) + 1}.svg`,
    organizerId: orgId(s.organizer),
    status: statusOf(startDate, endDate),
    deadline: iso(...s.deadline, 23),
    prizeFundUzs: s.prizeMln * 1_000_000,
    categoryId: "competition",
  };
});

const FESTIVAL_SEEDS: (Seed & { lineup: string[] })[] = [
  { title: "«Sharq ohanglari» musiqa festivali", description: "Xalq va klassik musiqa ijrochilarini birlashtiruvchi festival. Dasturda orkestr, xor va yakkaxon chiqishlar bor.", region: "samarkand", start: [2026, 10, 10], end: [2026, 10, 14], organizer: 7, lineup: ["Samarqand simfonik orkestri", "Buxoro xalq cholgʻulari orkestri", "Xorazm maqom orkestri"] },
  { title: "Bahor musiqa festivali", description: "Har yili bahorda Toshkentda oʻtkaziladigan yosh iqtidorlar festivali.", region: "tashkent-city", start: [2026, 4, 1], end: [2026, 4, 5], organizer: 1, lineup: ["Toshkent yoshlar xori", "Toshkent kamera orkestri"] },
  { title: "Jazz kunlari festivali", description: "Jazz va xalq musiqasi uygʻunligiga bagʻishlangan uch kunlik festival.", region: "tashkent-city", start: [2027, 3, 14], end: [2027, 3, 16], organizer: 6, lineup: ["Respublika jazz-orkestri", "Fargʻona estrada-simfonik orkestri"] },
];

export const FESTIVALS: Festival[] = FESTIVAL_SEEDS.map((s, i) => {
  const region = REGIONS.find((r) => r.id === s.region)!;
  const startDate = iso(...s.start, 10);
  const endDate = iso(...s.end, 22);
  return {
    id: `festival-${i + 1}`,
    slug: slugify(s.title),
    title: s.title,
    description: s.description,
    regionId: s.region,
    city: region.cities[0],
    startDate,
    endDate,
    imageUrl: `/placeholders/cover-${((i + 3) % 6) + 1}.svg`,
    organizerId: orgId(s.organizer),
    status: statusOf(startDate, endDate),
    lineup: s.lineup,
  };
});
