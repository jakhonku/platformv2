import type { NewsItem } from "../../types/content.ts";
import { iso } from "./now.ts";
import { slugify } from "./names.ts";

const SEEDS: { title: string; category: string; excerpt: string }[] = [
  { title: "Respublika yosh skripkachilar tanloviga qabul boshlandi", category: "announcements", excerpt: "Tanlovga arizalar 1-noyabrgacha qabul qilinadi." },
  { title: "Samarqand simfonik orkestri yangi mavsumni ochdi", category: "concerts", excerpt: "Mavsum ochilishida Betxoven simfoniyalari yangradi." },
  { title: "Yosh vokalchi xalqaro tanlovda birinchi oʻrinni egalladi", category: "achievements", excerpt: "Toshkentlik soprano ijrochi Yevropadagi tanlovda gʻolib boʻldi." },
  { title: "Dirijyor bilan intervyu: orkestr — bu oila", category: "interviews", excerpt: "Tajribali dirijyor jamoa bilan ishlash sirlarini oʻrtoqlashdi." },
  { title: "Konservatoriyada yangi mahorat darslari seriyasi", category: "education", excerpt: "Skripka va vokal boʻyicha ochiq darslar rejalashtirilgan." },
  { title: "«Sharq ohanglari» festivali dasturi eʼlon qilindi", category: "announcements", excerpt: "Festival Samarqandda besh kun davom etadi." },
  { title: "Buxoro xalq cholgʻulari orkestri gastrolga chiqdi", category: "concerts", excerpt: "Jamoa uchta viloyatda konsert beradi." },
  { title: "Maqom ijrochilari tanlovi yakunlandi", category: "achievements", excerpt: "Gʻoliblar jamoatchilik oldida taqdirlandi." },
  { title: "Yoshlar xori yangi aʼzolar qabul qilmoqda", category: "announcements", excerpt: "Soprano va alt ovozlari uchun kasting eʼlon qilindi." },
  { title: "Kompozitor: zamonaviy oʻzbek musiqasi qayerga ketmoqda?", category: "interviews", excerpt: "Yosh kompozitor kelajak rejalari haqida gapirdi." },
  { title: "Jazz kunlari festivali sanasi belgilandi", category: "announcements", excerpt: "Festival 2027-yil mart oyida Toshkentda oʻtadi." },
  { title: "Maktab oʻquvchilari uchun orkestr darslari boshlandi", category: "education", excerpt: "Loyiha doirasida jonli konsert va tushuntirishlar tashkil etiladi." },
];

export const NEWS: NewsItem[] = SEEDS.map((s, i) => ({
  id: `news-${String(i + 1).padStart(2, "0")}`,
  slug: slugify(s.title),
  title: s.title,
  excerpt: s.excerpt,
  body: `${s.excerpt} Batafsil maʼlumot tashkilotchilar tomonidan keyinroq eʼlon qilinadi. Platformada kuzatib boring: yangi kasting, tanlov va festivallar haqidagi barcha xabarlar shu yerda chop etiladi.`,
  categoryId: s.category,
  authorId: "user-moderator",
  imageUrl: `/placeholders/cover-${(i % 6) + 1}.svg`,
  // Eng yangisi birinchi: har keyingi yangilik oldingisidan 7 kun oldin
  publishedAt: new Date(Date.parse(iso(2026, 9, 28, 9)) - i * 7 * 86400000).toISOString(),
}));
