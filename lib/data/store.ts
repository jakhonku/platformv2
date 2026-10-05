import type { Collective, CollectiveInvite, Organization } from "../../types/collective.ts";
import type { Application, Casting, Vacancy } from "../../types/opportunity.ts";
import type { MediaItem } from "../../types/media.ts";
import type { TalentProfile } from "../../types/talent.ts";
import type { AuditLogEntry, Notification, NotificationChannel } from "../../types/system.ts";
import type { Invitation } from "../../types/invitation.ts";
import type { User } from "../../types/user.ts";
import {
  APPLICATIONS,
  AUDIT_LOG,
  CASTINGS,
  CHOIRS,
  COLLECTIONS,
  COMPETITIONS,
  FESTIVALS,
  INVITATIONS,
  NEWS,
  MEDIA,
  NOTIFICATIONS,
  ORCHESTRAS,
  ORGANIZATIONS,
  TALENTS,
  USERS,
  VACANCIES,
} from "../mock/index.ts";
import { CATEGORIES, INSTRUMENTS, REGIONS, VOICE_TYPES } from "../constants/index.ts";
import type { Banner, SystemSettings } from "../../types/admin.ts";
import type { StoredAppeal } from "../../types/appeal.ts";
import type { ReviewState } from "../../types/review.ts";
import type { Competition, Festival, NewsItem } from "../../types/content.ts";
import type { Category, Instrument, Region, VoiceType } from "../../types/reference.ts";
import { clone } from "./text.ts";

/**
 * Mutatsiyalar uchun modul xotirasi. Mock massivlarning nusxasi: asl mock hech qachon o'zgarmaydi.
 * Backend ulanganda shu fayl va lib/data/* ichidagi chaqiruvlar fetch('/api/...') ga almashtiriladi.
 */
/** Demo uchun ikkita yangi (kutilayotgan) jamoa: biri to'liq, biri ma'lumotlari yetarli emas */
function pendingCollectiveSeeds(): Collective[] {
  const base = clone(ORCHESTRAS[0]) as Collective;
  const make = (n: number, name: string, complete: boolean): Collective => ({
    ...base,
    id: `collective-pending-${n}`,
    slug: `kutilayotgan-jamoa-${n}`,
    name,
    members: [],
    events: [],
    repertoire: [],
    verified: false,
    moderation: "pending",
    moderationNote: undefined,
    description: complete ? "Yoshlardan tashkil topgan kamera orkestri: klassik va zamonaviy asarlar ijrosi." : "",
    city: complete ? "Toshkent" : "",
    contacts: { phone: complete ? "+998 90 555 12 34" : undefined, email: complete ? "info@example.uz" : undefined },
    documents: complete ? ["nizom.pdf", "rahbarlik-buyrugi.pdf"] : [],
  });
  return [make(1, "Yosh sozandalar kamera orkestri", true), make(2, "Sharq ohanglari ansambli", false)];
}

/** Demo uchun uchta xat: biri javob berilgan, ikkitasi navbatda (admin ko'radi) */
function seedAppeals(): StoredAppeal[] {
  const talent = USERS.find((u) => u.roles.includes("musician"));
  const org = USERS.find((u) => u.roles.includes("organization"));
  const ADMIN = "Platforma administratsiyasi";
  const out: StoredAppeal[] = [];
  if (talent) {
    out.push({
      id: "appeal-seed-1",
      number: "XT-2026-000001",
      userId: talent.id,
      authorName: talent.fullName,
      authorRole: "musician",
      kind: "suggestion",
      subject: "Portfolioga audio fayl yuklashni osonlashtiring",
      status: "answered",
      createdAt: "2026-09-28T09:00:00.000Z",
      submittedAt: "2026-09-28T09:00:00.000Z",
      updatedAt: "2026-09-29T11:20:00.000Z",
      openedAt: "2026-09-29T10:05:00.000Z",
      messages: [
        { id: "appeal-seed-1-m1", from: "user", authorName: talent.fullName, text: "Audio fayllarni birdaniga bir nechta yuklash imkoni boʻlsa, juda qulay boʻlardi.", at: "2026-09-28T09:00:00.000Z", attachments: [] },
        { id: "appeal-seed-1-m2", from: "admin", authorName: ADMIN, text: "Rahmat! Taklifingiz qabul qilindi va rivojlantirish rejasiga kiritildi.", at: "2026-09-29T11:20:00.000Z", attachments: [] },
      ],
      events: [
        { id: "appeal-seed-1-e1", type: "created", at: "2026-09-28T09:00:00.000Z", actorName: talent.fullName },
        { id: "appeal-seed-1-e2", type: "opened", at: "2026-09-29T10:05:00.000Z", actorName: ADMIN },
        { id: "appeal-seed-1-e3", type: "answered", at: "2026-09-29T11:20:00.000Z", actorName: ADMIN },
      ],
    });
    out.push({
      id: "appeal-seed-2",
      number: "XT-2026-000002",
      userId: talent.id,
      authorName: talent.fullName,
      authorRole: "musician",
      kind: "appeal",
      subject: "Profil rasmi koʻrinmayapti",
      status: "new",
      createdAt: "2026-10-03T14:10:00.000Z",
      submittedAt: "2026-10-03T14:10:00.000Z",
      updatedAt: "2026-10-03T14:10:00.000Z",
      messages: [{ id: "appeal-seed-2-m1", from: "user", authorName: talent.fullName, text: "Profilimga rasm yukladim, lekin katalogda eski rasm chiqyapti. Iltimos, tekshirib bering.", at: "2026-10-03T14:10:00.000Z", attachments: [] }],
      events: [{ id: "appeal-seed-2-e1", type: "created", at: "2026-10-03T14:10:00.000Z", actorName: talent.fullName }],
    });
  }
  if (org) {
    out.push({
      id: "appeal-seed-3",
      number: "XT-2026-000003",
      userId: org.id,
      authorName: org.fullName,
      authorRole: "organization",
      kind: "opening_request",
      subject: "Skripkachilar uchun kasting eʼlon qilish",
      status: "new",
      createdAt: "2026-10-04T08:30:00.000Z",
      submittedAt: "2026-10-04T08:30:00.000Z",
      updatedAt: "2026-10-04T08:30:00.000Z",
      messages: [{ id: "appeal-seed-3-m1", from: "user", authorName: org.fullName, text: "Kamera orkestri uchun 3 nafar skripkachi kerak. Kasting 20-oktabrgacha, Toshkentda oʻtkaziladi. Eʼlonni joylashtirib bering.", at: "2026-10-04T08:30:00.000Z", attachments: [] }],
      events: [{ id: "appeal-seed-3-e1", type: "created", at: "2026-10-04T08:30:00.000Z", actorName: org.fullName }],
    });
  }
  return out;
}

/** Demo: tasdiqlangan iqtidorlarning foydalanuvchilari OneID orqali tasdiqlangan hisob sifatida boshlanadi */
function withSeedIdentities(users: User[]): User[] {
  const verifiedOwners = new Set(TALENTS.filter((t) => t.verified && t.moderation === "approved").map((t) => t.userId));
  return users.map((u, i) =>
    verifiedOwners.has(u.id) && !u.identity ? { ...u, identity: { type: "individual", source: "oneid", verified: true, pinfl: `31201900${String(i + 1).padStart(6, "0")}` } } : u,
  );
}

const createStore = () => ({
  users: withSeedIdentities(clone(USERS) as User[]),
  talents: clone(TALENTS) as TalentProfile[],
  collectives: [...clone([...ORCHESTRAS, ...CHOIRS]), ...pendingCollectiveSeeds()] as Collective[],
  organizations: clone(ORGANIZATIONS) as Organization[],
  castings: clone(CASTINGS) as Casting[],
  vacancies: clone(VACANCIES) as Vacancy[],
  applications: clone(APPLICATIONS) as Application[],
  media: clone(MEDIA) as MediaItem[],
  collections: clone(COLLECTIONS),
  notifications: clone(NOTIFICATIONS) as Notification[],
  audit: clone(AUDIT_LOG) as AuditLogEntry[],
  invitations: clone(INVITATIONS) as Invitation[],
  settings: {} as Record<string, Record<NotificationChannel, boolean>>,
  appeals: seedAppeals(),
  appealSeq: 3,
  // Demo uchun ikkita kutilayotgan jamoa taklifi (birinchi tasdiqlangan iqtidorlarga)
  collectiveInvites: (() => {
    const col = ORCHESTRAS[2] ?? ORCHESTRAS[0];
    const targets = TALENTS.filter((t) => t.moderation === "approved" && t.verified && !col.members.some((m) => m.talentId === t.id)).slice(0, 2);
    return targets.map((t, i) => ({ id: `collective-invite-seed-${i + 1}`, collectiveId: col.id, talentId: t.id, section: i === 0 ? "Birinchi skripkalar" : "Alt partiyasi", status: "pending", createdAt: "2026-09-28T10:00:00.000Z" })) as CollectiveInvite[];
  })(),
  competitions: clone(COMPETITIONS) as Competition[],
  festivals: clone(FESTIVALS) as Festival[],
  news: clone(NEWS) as NewsItem[],
  banners: [
    { id: "banner-1", title: "Yangi mavsum kastinglari", link: "/castings", imageUrl: "/placeholders/cover-1.svg", active: true },
    { id: "banner-2", title: "Respublika tanlovlariga ariza bering", link: "/competitions", imageUrl: "/placeholders/cover-2.svg", active: false },
  ] as Banner[],
  references: {
    instruments: clone([...INSTRUMENTS]) as Instrument[],
    voiceTypes: clone([...VOICE_TYPES]) as VoiceType[],
    regions: clone([...REGIONS]) as Region[],
    categories: clone([...CATEGORIES]) as Category[],
  },
  // Ko'rib chiqish holati: kalit "<tur>:<id>"; demo uchun bitta tashkilot allaqachon tekshiruvda
  reviews: {
    "organization:org-09": {
      assigneeId: "user-moderator",
      assignedAt: "2026-10-02T10:00:00.000Z",
      checklist: { documents: true, phone: false },
      calls: [{ id: "call-seed-1", at: "2026-10-02T11:30:00.000Z", byId: "user-moderator", outcome: "no_answer", note: "Javob bermadi, ertaga qayta qoʻngʻiroq qilinadi." }],
    },
  } as Record<string, ReviewState>,
  system: {
    settings: { maintenanceMode: false, allowRegistration: true, moderationRequired: true, supportEmail: "support@talent.uz" } as SystemSettings,
    lastBackupAt: null as string | null,
  },
});

/**
 * Server jarayoni bo'yicha yagona holat: sahifalar, Server Action'lar va route handler'lar (masalan nishon PNG)
 * alohida bundle bo'lsa ham bir xil mock ma'lumotni ko'radi.
 */
/** Mock ma'lumot shakli o'zgarganda oshiriladi: dev serverda eski xotira holati bekor qilinadi */
const STORE_VERSION = 5;
const globalRef = globalThis as unknown as { __talentStore?: ReturnType<typeof createStore>; __talentStoreVersion?: number };
function resolveStore(): ReturnType<typeof createStore> {
  const existing = globalRef.__talentStore;
  if (!existing || globalRef.__talentStoreVersion !== STORE_VERSION) {
    globalRef.__talentStoreVersion = STORE_VERSION;
    return (globalRef.__talentStore = createStore());
  }
  // Dev rejimida (HMR) eski holat saqlanib qolishi mumkin: yangi qo'shilgan to'plamlar bo'sh holda qo'shiladi
  const fresh = createStore();
  for (const key of Object.keys(fresh) as (keyof typeof fresh)[]) {
    if (!(key in existing)) (existing as Record<string, unknown>)[key] = fresh[key];
  }
  return existing;
}

export const store = resolveStore();

