import type { IsoDate } from "./common.ts";
import type { Role } from "../lib/demo/role.ts";

/** Xat turi: taklif, umumiy murojaat yoki e'lon/tadbir qo'shish so'rovi (faqat platforma admini qo'shadi) */
export type AppealKind = "suggestion" | "appeal" | "opening_request" | "event_request";

/**
 * Xat holati (hujjat almashinuvi tizimlari kabi):
 * new — navbatda, in_review — admin ochib ko'rmoqda, answered — javob berilgan,
 * returned — tuzatish uchun qaytarilgan, closed — yopilgan.
 */
export type AppealStatus = "new" | "in_review" | "answered" | "returned" | "closed";

export type AppealAttachment = { id: string; name: string; size: number };

export type AppealMessage = {
  id: string;
  from: "user" | "admin";
  authorName: string;
  text: string;
  at: IsoDate;
  attachments: AppealAttachment[];
};

export type AppealEventType = "created" | "opened" | "followup" | "answered" | "returned" | "resubmitted" | "closed" | "reopened";

export type AppealEvent = { id: string; type: AppealEventType; at: IsoDate; actorName: string; note?: string };

export type Appeal = {
  id: string;
  /** Ro'yxatga olish raqami: XT-YYYY-NNNNNN */
  number: string;
  userId: string;
  authorName: string;
  authorRole: Role;
  kind: AppealKind;
  subject: string;
  status: AppealStatus;
  messages: AppealMessage[];
  events: AppealEvent[];
  /** Qaytarilgan xat uchun sabab */
  returnReason?: string;
  /** "Navbatda" holatidagi xat uchun: nechanchi o'rinda (1 — birinchi) */
  queuePosition?: number;
  openedAt?: IsoDate;
  createdAt: IsoDate;
  updatedAt: IsoDate;
};

/** Xotirada saqlanadigan shakl: PDF fayl mazmuni (data URL) ham bor, ro'yxatlarda esa yuborilmaydi */
export type StoredAppeal = Omit<Appeal, "messages" | "queuePosition"> & {
  messages: (Omit<AppealMessage, "attachments"> & { attachments: (AppealAttachment & { data: string })[] })[];
  /** Navbat tartibi uchun: yuborilgan (yoki qayta yuborilgan) vaqt */
  submittedAt: IsoDate;
};
