"use server";

// Mock mutatsiyalar SERVER xotirasida bajariladi: klient komponentlar shu Server Action'lar orqali chaqiradi,
// shunda `router.refresh()` dan keyin server sahifalari yangi holatni ko'radi. Natija `ActionResult` ko'rinishida
// qaytadi (DataError server chegarasida xabarga aylanib ketmasligi uchun).
import { DataError, type DataErrorCode } from "./errors.ts";
import { updateTalentProfile, addMedia, updateMedia, deleteMedia, createCollection, deleteCollection, respondToInvitation, saveNotificationSettings, markAllNotificationsRead, createCasting, createVacancy, setOpportunityStatus, updateCollective, inviteCollectiveMember, respondToCollectiveInvite, addCollectiveMember, removeCollectiveMember, addCollectiveEvent, removeCollectiveEvent } from "./cabinet.ts";
import { applyToCasting, applyToVacancy, updateApplicationStatus } from "./opportunities.ts";
import { sendInvitation } from "./invitations.ts";
import { markNotificationRead } from "./account.ts";
import { login, registerAccount, verifyCode, verifyAndActivate, oneIdSignIn } from "./auth.ts";
import { moderate } from "./admin.ts";
import { setUserStatus, setUserRoles, deleteOpening, saveCompetition, saveFestival, deleteEvent, saveNews, deleteNews, saveBanner, deleteBanner, saveReference, deleteReference, saveSystemSettings, createBackup } from "./admin-ops.ts";

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
export async function inviteCollectiveMemberAction(...args: Parameters<typeof inviteCollectiveMember>) {
  return run(() => inviteCollectiveMember(...args));
}
export async function respondToCollectiveInviteAction(...args: Parameters<typeof respondToCollectiveInvite>) {
  return run(() => respondToCollectiveInvite(...args));
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
export async function verifyAndActivateAction(...args: Parameters<typeof verifyAndActivate>) {
  return run(() => verifyAndActivate(...args));
}
export async function oneIdSignInAction(...args: Parameters<typeof oneIdSignIn>) {
  return run(() => oneIdSignIn(...args));
}
export async function moderateAction(...args: Parameters<typeof moderate>) {
  return run(() => moderate(...args));
}
export async function setUserStatusAction(...args: Parameters<typeof setUserStatus>) {
  return run(() => setUserStatus(...args));
}
export async function setUserRolesAction(...args: Parameters<typeof setUserRoles>) {
  return run(() => setUserRoles(...args));
}
export async function deleteOpeningAction(...args: Parameters<typeof deleteOpening>) {
  return run(() => deleteOpening(...args));
}
export async function saveCompetitionAction(...args: Parameters<typeof saveCompetition>) {
  return run(() => saveCompetition(...args));
}
export async function saveFestivalAction(...args: Parameters<typeof saveFestival>) {
  return run(() => saveFestival(...args));
}
export async function deleteEventAction(...args: Parameters<typeof deleteEvent>) {
  return run(() => deleteEvent(...args));
}
export async function saveNewsAction(...args: Parameters<typeof saveNews>) {
  return run(() => saveNews(...args));
}
export async function deleteNewsAction(...args: Parameters<typeof deleteNews>) {
  return run(() => deleteNews(...args));
}
export async function saveBannerAction(...args: Parameters<typeof saveBanner>) {
  return run(() => saveBanner(...args));
}
export async function deleteBannerAction(...args: Parameters<typeof deleteBanner>) {
  return run(() => deleteBanner(...args));
}
export async function saveReferenceAction(...args: Parameters<typeof saveReference>) {
  return run(() => saveReference(...args));
}
export async function deleteReferenceAction(...args: Parameters<typeof deleteReference>) {
  return run(() => deleteReference(...args));
}
export async function saveSystemSettingsAction(...args: Parameters<typeof saveSystemSettings>) {
  return run(() => saveSystemSettings(...args));
}
export async function createBackupAction(...args: Parameters<typeof createBackup>) {
  return run(() => createBackup(...args));
}
