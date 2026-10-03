import type { Casting, Requirements } from "../../types/opportunity.ts";
import { iso, MOCK_NOW } from "./now.ts";

type Seed = {
  title: string;
  org: number;
  req: Requirements;
  location: string;
  deadline: [number, number, number];
  event: [number, number, number];
};

const SEEDS: Seed[] = [
  { title: "Simfonik orkestrga skripkachilar kastingi", org: 1, req: { kinds: ["musician"], instrumentIds: ["violin"], minExperience: 3 }, location: "Toshkent, katta konsert zali", deadline: [2026, 10, 25], event: [2026, 11, 14] },
  { title: "Opera xoriga tenor va bas ovozlar kastingi", org: 3, req: { kinds: ["vocalist"], voiceTypeIds: ["tenor", "bass"], minExperience: 2 }, location: "Samarqand, opera teatri", deadline: [2026, 11, 5], event: [2026, 12, 1] },
  { title: "Kamera orkestriga violonchelchi kastingi", org: 1, req: { kinds: ["musician"], instrumentIds: ["cello"], minExperience: 4 }, location: "Toshkent, kamera zali", deadline: [2026, 10, 18], event: [2026, 11, 8] },
  { title: "Yoshlar xori uchun soprano va alt kastingi", org: 5, req: { kinds: ["vocalist"], voiceTypeIds: ["soprano", "alto"] }, location: "Toshkent viloyati, madaniyat markazi", deadline: [2026, 11, 20], event: [2026, 12, 12] },
  { title: "Maqom ansambliga dutorchi va tanburchi kastingi", org: 6, req: { kinds: ["musician"], instrumentIds: ["dutar", "tanbur"], regionIds: ["bukhara", "samarkand", "tashkent-city"] }, location: "Buxoro, maqom markazi", deadline: [2026, 10, 30], event: [2026, 11, 22] },
  { title: "Jazz-orkestrga saksofonchi kastingi", org: 6, req: { kinds: ["musician"], instrumentIds: ["saxophone"], minExperience: 2 }, location: "Toshkent, jazz klubi", deadline: [2026, 12, 3], event: [2027, 1, 16] },
  { title: "Festival gala-konserti uchun solistlar kastingi", org: 7, req: { kinds: ["musician", "vocalist"], minExperience: 5 }, location: "Samarqand, Registon maydoni", deadline: [2026, 11, 28], event: [2027, 1, 24] },
  { title: "Balet spektakli uchun orkestr artistlari kastingi", org: 3, req: { kinds: ["musician"], instrumentIds: ["flute", "oboe", "clarinet"], minExperience: 3 }, location: "Samarqand, opera va balet teatri", deadline: [2026, 12, 10], event: [2027, 2, 6] },
  { title: "Bolalar xoriga xormeyster yordamchisi kastingi", org: 5, req: { kinds: ["conductor"], minExperience: 3 }, location: "Toshkent viloyati, musiqa maktabi", deadline: [2026, 9, 12], event: [2026, 10, 1] },
  { title: "Kinomusiqa yozuvi uchun fleyta va goboy kastingi", org: 2, req: { kinds: ["musician"], instrumentIds: ["flute", "oboe"] }, location: "Toshkent, yozuv studiyasi", deadline: [2026, 8, 30], event: [2026, 9, 20] },
  { title: "Xalq cholgʻulari orkestriga doirachi kastingi", org: 4, req: { kinds: ["musician"], instrumentIds: ["doira"], regionIds: ["bukhara", "khorezm"] }, location: "Buxoro, musiqa kolleji", deadline: [2026, 9, 25], event: [2026, 10, 10] },
  { title: "Yoshlar orkestriga valtornachi kastingi", org: 2, req: { kinds: ["musician"], instrumentIds: ["french-horn", "trumpet"], minExperience: 1 }, location: "Navoiy, madaniyat saroyi", deadline: [2026, 11, 12], event: [2026, 12, 20] },
];

export const CASTINGS: Casting[] = SEEDS.map((s, i) => {
  const deadline = iso(...s.deadline);
  return {
    id: `casting-${String(i + 1).padStart(2, "0")}`,
    organizationId: `org-${String(s.org).padStart(2, "0")}`,
    title: s.title,
    description: `${s.title}. Ishtirokchilar ariza topshirib, portfolio materiallarini (video yoki audio) ilova qilishi kerak. Saralash bir necha bosqichda oʻtkaziladi, natijalar bildirishnoma orqali yuboriladi.`,
    requirements: s.req,
    location: s.location,
    eventDate: iso(...s.event),
    deadline,
    status: deadline < MOCK_NOW ? "closed" : "open",
    createdAt: iso(s.deadline[0], Math.max(1, s.deadline[1] - 2), 5, 9),
  };
});
