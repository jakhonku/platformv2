"use server";

// Mock mutatsiyalar SERVER xotirasida bajariladi: klient komponentlar shu Server Action'lar orqali chaqiradi,
// shunda `router.refresh()` dan keyin server sahifalari yangi holatni ko'radi. Natija `ActionResult` ko'rinishida
// qaytadi (DataError server chegarasida xabarga aylanib ketmasligi uchun).
import { DataError, type DataErrorCode } from "./errors.ts";
import { updateTalentProfile, addMedia, updateMedia, deleteMedia, createCollection, deleteCollection, respondToInvitation, saveNotificationSettings, markAllNotificationsRead, createCasting, createVacancy, setOpportunityStatus, updateCollective, addCollectiveMember, removeCollectiveMember, addCollectiveEvent, removeCollectiveEvent } from "./cabinet.ts";
import { applyToCasting, applyToVacancy, updateApplicationStatus } from "./opportunities.ts";
import { sendInvitation } from "./invitations.ts";
import { markNotificationRead } from "./account.ts";
import { login, registerAccount, verifyCode } from "./auth.ts";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; code: DataErrorCode; message: string };

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof DataError) return { ok: false, code: error.code, message: error.message };
    throw error;
  }
}
export async function updateTalentProfileAction(...args: Parameters<typeof updateTalentProfile>) {
  return run(() => updateTalentProfile(...args));
}
export async function addMediaAction(...args: Parameters<typeof addMedia>) {
  return run(() => addMedia(...args));
}
export async function updateMediaAction(...args: Parameters<typeof updateMedia>) {
  return run(() => updateMedia(...args));
}
export async function deleteMediaAction(...args: Parameters<typeof deleteMedia>) {
  return run(() => deleteMedia(...args));
}
export async function createCollectionAction(...args: Parameters<typeof createCollection>) {
  return run(() => createCollection(...args));
}
export async function deleteCollectionAction(...args: Parameters<typeof deleteCollection>) {
  return run(() => deleteCollection(...args));
}
export async function respondToInvitationAction(...args: Parameters<typeof respondToInvitation>) {
  return run(() => respondToInvitation(...args));
}
export async function saveNotificationSettingsAction(...args: Parameters<typeof saveNotificationSettings>) {
  return run(() => saveNotificationSettings(...args));
}
export async function markAllNotificationsReadAction(...args: Parameters<typeof markAllNotificationsRead>) {
  return run(() => markAllNotificationsRead(...args));
}
export async function createCastingAction(...args: Parameters<typeof createCasting>) {
  return run(() => createCasting(...args));
}
export async function createVacancyAction(...args: Parameters<typeof createVacancy>) {
  return run(() => createVacancy(...args));
}
export async function setOpportunityStatusAction(...args: Parameters<typeof setOpportunityStatus>) {
  return run(() => setOpportunityStatus(...args));
}
export async function updateCollectiveAction(...args: Parameters<typeof updateCollective>) {
  return run(() => updateCollective(...args));
}
export async function addCollectiveMemberAction(...args: Parameters<typeof addCollectiveMember>) {
  return run(() => addCollectiveMember(...args));
}
export async function removeCollectiveMemberAction(...args: Parameters<typeof removeCollectiveMember>) {
  return run(() => removeCollectiveMember(...args));
}
export async function addCollectiveEventAction(...args: Parameters<typeof addCollectiveEvent>) {
  return run(() => addCollectiveEvent(...args));
}
export async function removeCollectiveEventAction(...args: Parameters<typeof removeCollectiveEvent>) {
  return run(() => removeCollectiveEvent(...args));
}
export async function applyToCastingAction(...args: Parameters<typeof applyToCasting>) {
  return run(() => applyToCasting(...args));
}
export async function applyToVacancyAction(...args: Parameters<typeof applyToVacancy>) {
  return run(() => applyToVacancy(...args));
}
export async function updateApplicationStatusAction(...args: Parameters<typeof updateApplicationStatus>) {
  return run(() => updateApplicationStatus(...args));
}
export async function sendInvitationAction(...args: Parameters<typeof sendInvitation>) {
  return run(() => sendInvitation(...args));
}
export async function markNotificationReadAction(...args: Parameters<typeof markNotificationRead>) {
  return run(() => markNotificationRead(...args));
}
export async function loginAction(...args: Parameters<typeof login>) {
  return run(() => login(...args));
}
export async function registerAccountAction(...args: Parameters<typeof registerAccount>) {
  return run(() => registerAccount(...args));
}
export async function verifyCodeAction(...args: Parameters<typeof verifyCode>) {
  return run(() => verifyCode(...args));
}
