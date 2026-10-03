import type { EmploymentType, Requirements, Vacancy } from "../../types/opportunity.ts";
import { REGIONS } from "../constants/index.ts";
import { iso, MOCK_NOW } from "./now.ts";

type Seed = {
  title: string;
  org: number;
  region: string;
  employment: EmploymentType;
  salary: [number, number];
  req: Requirements;
  deadline: [number, number, number];
};

const SEEDS: Seed[] = [
  { title: "Konsertmeyster (skripka)", org: 1, region: "tashkent-city", employment: "full_time", salary: [9, 14], req: { kinds: ["musician"], instrumentIds: ["violin"], minExperience: 5 }, deadline: [2026, 11, 15] },
  { title: "Xor artisti (soprano)", org: 3, region: "samarkand", employment: "full_time", salary: [5, 8], req: { kinds: ["vocalist"], voiceTypeIds: ["soprano"], minExperience: 2 }, deadline: [2026, 10, 28] },
  { title: "Musiqa oʻqituvchisi (skripka)", org: 4, region: "bukhara", employment: "part_time", salary: [4, 7], req: { kinds: ["musician"], instrumentIds: ["violin"], minExperience: 3 }, deadline: [2026, 12, 1] },
  { title: "Orkestr dirijyori yordamchisi", org: 1, region: "tashkent-city", employment: "full_time", salary: [8, 12], req: { kinds: ["conductor"], minExperience: 4 }, deadline: [2026, 11, 30] },
  { title: "Vokal pedagogi", org: 2, region: "tashkent-city", employment: "full_time", salary: [7, 11], req: { kinds: ["vocalist"], minExperience: 5 }, deadline: [2026, 12, 15] },
  { title: "Fortepiano akkompaniatori", org: 5, region: "tashkent-region", employment: "part_time", salary: [4, 6], req: { kinds: ["musician"], instrumentIds: ["piano"], minExperience: 2 }, deadline: [2026, 10, 22] },
  { title: "Kompozitor-aranjirovkachi", org: 6, region: "tashkent-city", employment: "contract", salary: [6, 12], req: { kinds: ["composer"], minExperience: 3 }, deadline: [2027, 1, 10] },
  { title: "Studiya musiqachisi (gitara)", org: 6, region: "tashkent-city", employment: "contract", salary: [5, 9], req: { kinds: ["musician"], instrumentIds: ["electric-guitar", "bass-guitar"] }, deadline: [2026, 9, 18] },
  { title: "Dutor ustozi", org: 4, region: "bukhara", employment: "part_time", salary: [3, 5], req: { kinds: ["musician"], instrumentIds: ["dutar"] }, deadline: [2026, 9, 5] },
  { title: "Xormeyster", org: 3, region: "samarkand", employment: "full_time", salary: [7, 10], req: { kinds: ["conductor"], minExperience: 4 }, deadline: [2026, 12, 20] },
];

export const VACANCIES: Vacancy[] = SEEDS.map((s, i) => {
  const region = REGIONS.find((r) => r.id === s.region)!;
  const deadline = iso(...s.deadline);
  return {
    id: `vacancy-${String(i + 1).padStart(2, "0")}`,
    organizationId: `org-${String(s.org).padStart(2, "0")}`,
    title: s.title,
    description: `${s.title} lavozimi uchun nomzodlar qabul qilinadi. Talab etiladigan tajriba va portfolio ariza bilan birga topshiriladi.`,
    requirements: s.req,
    employment: s.employment,
    regionId: s.region,
    city: region.cities[0],
    salaryFromUzs: s.salary[0] * 1_000_000,
    salaryToUzs: s.salary[1] * 1_000_000,
    deadline,
    status: deadline < MOCK_NOW ? "closed" : "open",
    createdAt: iso(2026, 8, 10 + i, 9),
  };
});
