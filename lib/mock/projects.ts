import type { Project, ProjectStatus } from "../../types/content.ts";
import { CHOIRS, ORCHESTRAS } from "./collectives.ts";
import { iso } from "./now.ts";
import { slugify } from "./names.ts";
import { createRng } from "./random.ts";
import { TALENTS } from "./talents.ts";

type Seed = { title: string; description: string; status: ProjectStatus; org?: number };

const SEEDS: Seed[] = [
  { title: "Yosh iqtidorlar dasturi", description: "Hududlardagi yosh musiqachilarni aniqlash, ustozlar bilan bogʻlash va katta sahnaga olib chiqish dasturi.", status: "active", org: 5 },
  { title: "Maqom merosi — raqamli arxiv", description: "Shashmaqom ijrolarini yuqori sifatda yozib olish va ommaga ochiq arxivga joylash loyihasi.", status: "active", org: 4 },
  { title: "Orkestr va xor maktablarda", description: "Umumtaʼlim maktablarida jonli konsert va tushuntirish darslari seriyasi.", status: "active", org: 5 },
  { title: "Mahalliy kompozitorlar antologiyasi", description: "Zamonaviy oʻzbek kompozitorlarining asarlari toʻplami: partituralar va yozuvlar.", status: "planned", org: 2 },
  { title: "Hududlararo gastrol turi", description: "Orkestr va xor jamoalarining viloyatlar boʻylab konsert turi.", status: "planned", org: 1 },
  { title: "Bolalar musiqa laboratoriyasi", description: "Bolalar uchun ijodiy musiqa ustaxonalari va birgalikda yozish loyihasi.", status: "completed", org: 5 },
  { title: "Kamera konsertlari seriyasi", description: "Haftalik kamera konsertlari: yosh ijrochilar uchun mashhur zallarda chiqish imkoniyati.", status: "active", org: 1 },
  { title: "Jazz va xalq musiqasi uygʻunligi", description: "Jazz musiqachilari va xalq cholgʻulari ijrochilarining birgalikdagi eksperimental loyihasi.", status: "completed", org: 6 },
];

const rng = createRng(31337);
const approved = TALENTS.filter((t) => t.moderation === "approved");

export const PROJECTS: Project[] = SEEDS.map((s, i) => ({
  id: `project-${i + 1}`,
  slug: slugify(s.title),
  title: s.title,
  description: s.description,
  status: s.status,
  startDate: s.status === "planned" ? iso(2027, 1 + i, 10, 9) : iso(2026, 1 + i, 10, 9),
  endDate: s.status === "completed" ? iso(2026, 6, 30, 9) : undefined,
  organizationId: s.org ? `org-${String(s.org).padStart(2, "0")}` : undefined,
  collectiveIds: [rng.pick(ORCHESTRAS).id, rng.pick(CHOIRS).id],
  talentIds: rng.shuffle(approved).slice(0, rng.int(3, 6)).map((t) => t.id),
  imageUrl: `/placeholders/cover-${(i % 6) + 1}.svg`,
}));
