import type { Organization, OrganizationKind } from "../../types/collective.ts";
import type { ModerationStatus } from "../../types/common.ts";
import { REGIONS } from "../constants/index.ts";
import { phone, slugify } from "./names.ts";
import { createRng, randomDate } from "./random.ts";

type Seed = { name: string; kind: OrganizationKind; regionId: string; verification: ModerationStatus };

const SEEDS: Seed[] = [
  { name: "Sharq Navolari filarmoniyasi", kind: "philharmonic", regionId: "tashkent-city", verification: "approved" },
  { name: "Toshkent Musiqa Konservatoriyasi", kind: "conservatory", regionId: "tashkent-city", verification: "approved" },
  { name: "Samarqand Opera va balet teatri", kind: "theatre", regionId: "samarkand", verification: "approved" },
  { name: "Buxoro musiqa kolleji", kind: "college", regionId: "bukhara", verification: "approved" },
  { name: "Yosh iqtidorlar musiqa maktabi", kind: "school", regionId: "tashkent-region", verification: "approved" },
  { name: "Maqom Plus ijodiy agentligi", kind: "agency", regionId: "tashkent-city", verification: "approved" },
  { name: "Sharq taronalari festival qoʻmitasi", kind: "festival_org", regionId: "samarkand", verification: "approved" },
  { name: "Fargʻona viloyat filarmoniyasi", kind: "philharmonic", regionId: "fergana", verification: "pending" },
  { name: "Xorazm sanʼat kolleji", kind: "college", regionId: "khorezm", verification: "pending" },
  { name: "Oltin Nota ijodiy uyushmasi", kind: "agency", regionId: "namangan", verification: "rejected" },
];

const KIND_LABEL: Record<OrganizationKind, string> = {
  philharmonic: "filarmoniya",
  theatre: "teatr",
  conservatory: "oliy musiqa taʼlimi muassasasi",
  college: "musiqa kolleji",
  school: "musiqa maktabi",
  festival_org: "festival tashkilotchisi",
  agency: "ijodiy agentlik",
};

const rng = createRng(4242);

export const ORGANIZATIONS: Organization[] = SEEDS.map((s, i) => {
  const region = REGIONS.find((r) => r.id === s.regionId)!;
  const slug = slugify(s.name);
  return {
    id: `org-${String(i + 1).padStart(2, "0")}`,
    slug,
    name: s.name,
    kind: s.kind,
    logoUrl: `/placeholders/logo-${(i % 6) + 1}.svg`,
    regionId: s.regionId,
    city: region.cities[0],
    description: `${s.name} — ${KIND_LABEL[s.kind]}. Iqtidorli musiqachilar, xoristlar va jamoalar bilan hamkorlik qiladi, kasting va tanlovlar eʼlon qiladi.`,
    verification: s.verification,
    stir: String(200000000 + i * 3571 + 111),
    documents: ["guvohnoma.pdf", "nizom.pdf"],
    contacts: {
      phone: phone(rng.int(0, 9), rng.int(100, 999), rng.int(10, 99), rng.int(10, 99)),
      email: `info@${slug.slice(0, 20)}.example.uz`,
      website: `https://${slug.slice(0, 20)}.example.uz`,
    },
    createdAt: randomDate(rng, "2024-01-01", "2026-06-01"),
  };
});
