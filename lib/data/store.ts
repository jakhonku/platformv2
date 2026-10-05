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

export const store = {
  users: clone(USERS) as User[],
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
      calls: [{ id: "call-seed-1", at: "2026-10-02T11:30:00.000Z", byId: "user-moderator", outcome: "no_answer", note: "Javob bermadi, ertaga qayta qo'ng'iroq qilinadi." }],
    },
  } as Record<string, ReviewState>,
  system: {
    settings: { maintenanceMode: false, allowRegistration: true, moderationRequired: true, supportEmail: "support@talent.uz" } as SystemSettings,
    lastBackupAt: null as string | null,
  },
};
