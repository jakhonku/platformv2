import { z } from "zod";
import type { Appeal, AppealEventType, AppealKind, AppealStatus, StoredAppeal } from "../../types/appeal.ts";
import { isPdfDataUrl, MAX_PDF_BYTES, MAX_PDF_FILES, type PdfUpload, validatePdf } from "../appeal-files.ts";
import { DataError } from "./errors.ts";
import { logAudit } from "./audit.ts";
import { simulateLatency } from "./latency.ts";
import { store } from "./store.ts";
import { clone } from "./text.ts";

export const APPEAL_KINDS = ["suggestion", "appeal", "opening_request", "event_request"] as const satisfies readonly AppealKind[];
export const ADMIN_NAME = "Platforma administratsiyasi";

const invalid = (message = "Maʼlumotlar notoʻgʻri") => new DataError("invalid", message);
const subjectSchema = z.string().trim().min(5).max(150);
const textSchema = z.string().trim().max(3000);

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const find = (id: string): StoredAppeal => {
  const a = store.appeals.find((x) => x.id === id);
  if (!a) throw new DataError("not_found", "Xat topilmadi");
  return a;
};

/** Ro'yxatga olish raqami: XT-YYYY-NNNNNN */
const nextNumber = (): string => `XT-${new Date().getFullYear()}-${String(++store.appealSeq).padStart(6, "0")}`;

/** Ichki shakldan ommaga: PDF mazmuni olib tashlanadi, navbat o'rni hisoblanadi */
function view(a: StoredAppeal): Appeal {
  const { submittedAt, messages, ...rest } = a;
  const queuePosition = a.status === "new" ? store.appeals.filter((x) => x.status === "new" && x.submittedAt < submittedAt).length + 1 : undefined;
  return clone({ ...rest, messages: messages.map((m) => ({ ...m, attachments: m.attachments.map(({ id, name, size }) => ({ id, name, size })) })), ...(queuePosition ? { queuePosition } : {}) });
}

const byUpdated = (a: StoredAppeal, b: StoredAppeal) => b.updatedAt.localeCompare(a.updatedAt);

function pushEvent(a: StoredAppeal, type: AppealEventType, actorName: string, note?: string, at = new Date().toISOString()): void {
  a.events.push({ id: newId("evt"), type, at, actorName, ...(note ? { note } : {}) });
  a.updatedAt = at;
}

function notify(userId: string, title: string, body: string): void {
  store.notifications.unshift({ id: newId("notif"), userId, channel: "internal", title, body, link: "/cabinet/appeals", read: false, createdAt: new Date().toISOString() });
}

/** Matn va PDF ilovalarni tekshiradi: matn kamida 10 belgi yoki kamida bitta PDF bo'lishi kerak */
function parseContent(text: string | undefined, files: PdfUpload[] | undefined): { text: string; attachments: { id: string; name: string; size: number; data: string }[] } {
  const t = textSchema.safeParse(text ?? "");
  if (!t.success) throw invalid("Matn juda uzun");
  const list = files ?? [];
  if (list.length > MAX_PDF_FILES) throw invalid("PDF fayllar soni oshib ketdi");
  for (const f of list) {
    if (validatePdf(f) !== "ok" || !isPdfDataUrl(f.dataUrl) || f.dataUrl.length > Math.ceil((MAX_PDF_BYTES * 4) / 3) + 64) throw invalid("PDF fayl notoʻgʻri");
  }
  if (t.data.length < 10 && list.length === 0) throw invalid("Xat matnini yozing yoki PDF biriktiring");
  return { text: t.data, attachments: list.map((f) => ({ id: newId("file"), name: f.name.trim().slice(0, 120), size: f.size, data: f.dataUrl })) };
}

/** Foydalanuvchi xat yuboradi: matn yozadi va/yoki PDF biriktiradi; xat raqam oladi va navbatga qo'yiladi */
export async function createAppeal(userId: string, p: { kind: AppealKind; subject: string; message?: string; files?: PdfUpload[] }): Promise<Appeal> {
  await simulateLatency();
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new DataError("not_found", "Foydalanuvchi topilmadi");
  const head = z.object({ kind: z.enum(APPEAL_KINDS), subject: subjectSchema }).safeParse(p);
  if (!head.success) throw invalid();
  const content = parseContent(p.message, p.files);
  const now = new Date().toISOString();
  const appeal: StoredAppeal = {
    id: newId("appeal"),
    number: nextNumber(),
    userId,
    authorName: user.fullName,
    authorRole: user.roles[0] ?? "member",
    kind: head.data.kind,
    subject: head.data.subject,
    status: "new",
    createdAt: now,
    submittedAt: now,
    updatedAt: now,
    messages: [{ id: newId("msg"), from: "user", authorName: user.fullName, text: content.text, at: now, attachments: content.attachments }],
    events: [],
  };
  pushEvent(appeal, "created", user.fullName, undefined, now);
  store.appeals.unshift(appeal);
  return view(appeal);
}

export async function getMyAppeals(userId: string): Promise<Appeal[]> {
  await simulateLatency();
  return store.appeals.filter((a) => a.userId === userId).sort(byUpdated).map(view);
}

export async function getAppealById(id: string): Promise<Appeal | null> {
  await simulateLatency();
  const a = store.appeals.find((x) => x.id === id);
  return a ? view(a) : null;
}

/**
 * Foydalanuvchi o'z xatiga qo'shimcha yozadi. Xat qaytarilgan bo'lsa — tuzatib qayta yuborish:
 * xat yana navbatning oxiriga qo'yiladi. Yopilgan xatga yozib bo'lmaydi.
 */
export async function addAppealMessage(userId: string, appealId: string, p: { text?: string; files?: PdfUpload[] }): Promise<Appeal> {
  await simulateLatency();
  const a = find(appealId);
  if (a.userId !== userId) throw new DataError("forbidden", "Bu xat sizniki emas");
  if (a.status === "closed") throw new DataError("forbidden", "Xat yopilgan");
  const content = parseContent(p.text, p.files);
  const now = new Date().toISOString();
  a.messages.push({ id: newId("msg"), from: "user", authorName: a.authorName, text: content.text, at: now, attachments: content.attachments });
  if (a.status === "returned") {
    a.status = "new";
    a.submittedAt = now;
    a.returnReason = undefined;
    pushEvent(a, "resubmitted", a.authorName, undefined, now);
  } else {
    if (a.status === "answered") {
      a.status = "new";
      a.submittedAt = now;
    }
    pushEvent(a, "followup", a.authorName, undefined, now);
  }
  return view(a);
}

/** Admin: barcha xatlar (navbatdagilar birinchi, eng eskisi yuqorida; qolganlari yangilik tartibida) */
export async function getAppeals(status?: AppealStatus): Promise<Appeal[]> {
  await simulateLatency();
  const list = store.appeals.filter((a) => !status || a.status === status);
  const queue = list.filter((a) => a.status === "new").sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const rest = list.filter((a) => a.status !== "new").sort(byUpdated);
  return [...queue, ...rest].map(view);
}

export async function countNewAppeals(): Promise<number> {
  await simulateLatency();
  return store.appeals.filter((a) => a.status === "new").length;
}

/** Admin xatni ochadi: navbatdagi xat "ko'rib chiqilmoqda" holatiga o'tadi, yuboruvchi xabardor qilinadi */
export async function markAppealOpened(appealId: string, actorId: string): Promise<Appeal> {
  await simulateLatency();
  const a = find(appealId);
  if (a.status === "new") {
    const now = new Date().toISOString();
    a.status = "in_review";
    a.openedAt = now;
    pushEvent(a, "opened", ADMIN_NAME, undefined, now);
    notify(a.userId, "Xatingiz ko‘rib chiqilmoqda", `${a.number} · ${a.subject}`);
    logAudit(actorId, "appeal.opened", "appeal", a.id, a.number);
  }
  return view(a);
}

/** Admin javob yuboradi (matn va/yoki PDF); `close` — javob bilan birga yopish */
export async function replyToAppeal(appealId: string, actorId: string, p: { text?: string; files?: PdfUpload[] }, close = false): Promise<Appeal> {
  await simulateLatency();
  const a = find(appealId);
  const content = parseContent(p.text, p.files);
  const now = new Date().toISOString();
  a.messages.push({ id: newId("msg"), from: "admin", authorName: ADMIN_NAME, text: content.text, at: now, attachments: content.attachments });
  a.openedAt ??= now;
  a.status = close ? "closed" : "answered";
  a.returnReason = undefined;
  pushEvent(a, "answered", ADMIN_NAME, undefined, now);
  if (close) pushEvent(a, "closed", ADMIN_NAME, undefined, now);
  notify(a.userId, "Xatingizga javob berildi", `${a.number} · ${a.subject}`);
  logAudit(actorId, close ? "appeal.reply_close" : "appeal.reply", "appeal", a.id, a.number);
  return view(a);
}

/** Admin xatni tuzatish uchun yuboruvchiga qaytaradi (sabab majburiy) */
export async function returnAppeal(appealId: string, actorId: string, reason: string): Promise<Appeal> {
  await simulateLatency();
  const a = find(appealId);
  const r = z.string().trim().min(10).max(500).safeParse(reason);
  if (!r.success) throw invalid("Qaytarish sababi kamida 10 ta belgi");
  if (a.status === "closed") throw new DataError("forbidden", "Yopilgan xatni qaytarib boʻlmaydi");
  a.status = "returned";
  a.returnReason = r.data;
  pushEvent(a, "returned", ADMIN_NAME, r.data);
  notify(a.userId, "Xatingiz qaytarildi", `${a.number} · ${r.data}`);
  logAudit(actorId, "appeal.returned", "appeal", a.id, `${a.number}: ${r.data}`);
  return view(a);
}

/** Yopish yoki qayta ochish */
export async function setAppealStatus(appealId: string, status: "closed" | "in_review", actorId: string): Promise<Appeal> {
  await simulateLatency();
  const a = find(appealId);
  if (status !== "closed" && status !== "in_review") throw invalid();
  if (a.status === status) return view(a);
  a.status = status;
  pushEvent(a, status === "closed" ? "closed" : "reopened", ADMIN_NAME);
  if (status === "closed") notify(a.userId, "Xatingiz yopildi", `${a.number} · ${a.subject}`);
  logAudit(actorId, `appeal.${status}`, "appeal", a.id, a.number);
  return view(a);
}

/** PDF faylni berish (route handler uchun): foydalanuvchi huquqi chaqiruvchida tekshiriladi */
export async function getAppealFile(appealId: string, fileId: string): Promise<{ userId: string; name: string; data: string } | null> {
  const a = store.appeals.find((x) => x.id === appealId);
  if (!a) return null;
  for (const m of a.messages) {
    const f = m.attachments.find((x) => x.id === fileId);
    if (f) return { userId: a.userId, name: f.name, data: f.data };
  }
  return null;
}
