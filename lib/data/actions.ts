"use server";

// Mock mutatsiyalar SERVER xotirasida bajariladi: klient komponentlar shu Server Action'lar orqali chaqiradi,
// shunda `router.refresh()` dan keyin server sahifalari yangi holatni ko'radi. Natija `ActionResult` ko'rinishida
// qaytadi (DataError server chegarasida xabarga aylanib ketmasligi uchun).
import { DataError, type DataErrorCode } from "./errors.ts";
import { assertAdmin } from "./guards.ts";
import { createAppeal, addAppealMessage, replyToAppeal, setAppealStatus, markAppealOpened, returnAppeal } from "./appeals.ts";
import { updateTalentProfile, addMedia, updateMedia, deleteMedia, createCollection, deleteCollection, respondToInvitation, saveNotificationSettings, markAllNotificationsRead, createCasting, createVacancy, setOpportunityStatus, updateCollective, updateOrganization, setAvatar, inviteCollectiveMember, respondToCollectiveInvite, addCollectiveMember, removeCollectiveMember, addCollectiveEvent, removeCollectiveEvent } from "./cabinet.ts";
import { applyToCasting, applyToVacancy, updateApplicationStatus } from "./opportunities.ts";
import { sendInvitation } from "./invitations.ts";
import { markNotificationRead } from "./account.ts";
import { login, registerAccount, verifyCode, verifyAndActivate, oneIdSignIn, requestRegistrationCode, registerMember, requestLoginCode, loginWithPhone, verifyIdentity, joinCreators } from "./auth.ts";
import { moderate } from "./admin.ts";
import { startReview, setReviewChecklist, logReviewCall } from "./review.ts";
import { importCollectiveMembers, importOrganizationStaff } from "./import.ts";
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
export async function createAppealAction(...args: Parameters<typeof createAppeal>) {
  return run(async () => {
    return createAppeal(...args);
  });
}
export async function addAppealMessageAction(...args: Parameters<typeof addAppealMessage>) {
  return run(async () => {
    return addAppealMessage(...args);
  });
}
export async function replyToAppealAction(...args: Parameters<typeof replyToAppeal>) {
  return run(async () => {
    await assertAdmin(); return replyToAppeal(...args);
  });
}
export async function setAppealStatusAction(...args: Parameters<typeof setAppealStatus>) {
  return run(async () => {
    await assertAdmin(); return setAppealStatus(...args);
  });
}
export async function markAppealOpenedAction(...args: Parameters<typeof markAppealOpened>) {
  return run(async () => {
    await assertAdmin(); return markAppealOpened(...args);
  });
}
export async function returnAppealAction(...args: Parameters<typeof returnAppeal>) {
  return run(async () => {
    await assertAdmin(); return returnAppeal(...args);
  });
}
export async function updateTalentProfileAction(...args: Parameters<typeof updateTalentProfile>) {
  return run(async () => {
    return updateTalentProfile(...args);
  });
}
export async function addMediaAction(...args: Parameters<typeof addMedia>) {
  return run(async () => {
    return addMedia(...args);
  });
}
export async function updateMediaAction(...args: Parameters<typeof updateMedia>) {
  return run(async () => {
    return updateMedia(...args);
  });
}
export async function deleteMediaAction(...args: Parameters<typeof deleteMedia>) {
  return run(async () => {
    return deleteMedia(...args);
  });
}
export async function createCollectionAction(...args: Parameters<typeof createCollection>) {
  return run(async () => {
    return createCollection(...args);
  });
}
export async function deleteCollectionAction(...args: Parameters<typeof deleteCollection>) {
  return run(async () => {
    return deleteCollection(...args);
  });
}
export async function respondToInvitationAction(...args: Parameters<typeof respondToInvitation>) {
  return run(async () => {
    return respondToInvitation(...args);
  });
}
export async function saveNotificationSettingsAction(...args: Parameters<typeof saveNotificationSettings>) {
  return run(async () => {
    return saveNotificationSettings(...args);
  });
}
export async function markAllNotificationsReadAction(...args: Parameters<typeof markAllNotificationsRead>) {
  return run(async () => {
    return markAllNotificationsRead(...args);
  });
}
export async function createCastingAction(...args: Parameters<typeof createCasting>) {
  return run(async () => {
    await assertAdmin(); return createCasting(...args);
  });
}
export async function createVacancyAction(...args: Parameters<typeof createVacancy>) {
  return run(async () => {
    await assertAdmin(); return createVacancy(...args);
  });
}
export async function setOpportunityStatusAction(...args: Parameters<typeof setOpportunityStatus>) {
  return run(async () => {
    await assertAdmin(); return setOpportunityStatus(...args);
  });
}
export async function updateCollectiveAction(...args: Parameters<typeof updateCollective>) {
  return run(async () => {
    return updateCollective(...args);
  });
}
export async function updateOrganizationAction(...args: Parameters<typeof updateOrganization>) {
  return run(async () => {
    return updateOrganization(...args);
  });
}
export async function setAvatarAction(...args: Parameters<typeof setAvatar>) {
  return run(async () => {
    return setAvatar(...args);
  });
}
export async function inviteCollectiveMemberAction(...args: Parameters<typeof inviteCollectiveMember>) {
  return run(async () => {
    return inviteCollectiveMember(...args);
  });
}
export async function respondToCollectiveInviteAction(...args: Parameters<typeof respondToCollectiveInvite>) {
  return run(async () => {
    return respondToCollectiveInvite(...args);
  });
}
export async function addCollectiveMemberAction(...args: Parameters<typeof addCollectiveMember>) {
  return run(async () => {
    return addCollectiveMember(...args);
  });
}
export async function removeCollectiveMemberAction(...args: Parameters<typeof removeCollectiveMember>) {
  return run(async () => {
    return removeCollectiveMember(...args);
  });
}
export async function addCollectiveEventAction(...args: Parameters<typeof addCollectiveEvent>) {
  return run(async () => {
    await assertAdmin(); return addCollectiveEvent(...args);
  });
}
export async function removeCollectiveEventAction(...args: Parameters<typeof removeCollectiveEvent>) {
  return run(async () => {
    await assertAdmin(); return removeCollectiveEvent(...args);
  });
}
export async function applyToCastingAction(...args: Parameters<typeof applyToCasting>) {
  return run(async () => {
    return applyToCasting(...args);
  });
}
export async function applyToVacancyAction(...args: Parameters<typeof applyToVacancy>) {
  return run(async () => {
    return applyToVacancy(...args);
  });
}
export async function updateApplicationStatusAction(...args: Parameters<typeof updateApplicationStatus>) {
  return run(async () => {
    return updateApplicationStatus(...args);
  });
}
export async function sendInvitationAction(...args: Parameters<typeof sendInvitation>) {
  return run(async () => {
    return sendInvitation(...args);
  });
}
export async function markNotificationReadAction(...args: Parameters<typeof markNotificationRead>) {
  return run(async () => {
    return markNotificationRead(...args);
  });
}
export async function loginAction(...args: Parameters<typeof login>) {
  return run(async () => {
    return login(...args);
  });
}
export async function registerAccountAction(...args: Parameters<typeof registerAccount>) {
  return run(async () => {
    return registerAccount(...args);
  });
}
export async function verifyCodeAction(...args: Parameters<typeof verifyCode>) {
  return run(async () => {
    return verifyCode(...args);
  });
}
export async function verifyAndActivateAction(...args: Parameters<typeof verifyAndActivate>) {
  return run(async () => {
    return verifyAndActivate(...args);
  });
}
export async function oneIdSignInAction(...args: Parameters<typeof oneIdSignIn>) {
  return run(async () => {
    return oneIdSignIn(...args);
  });
}
export async function requestRegistrationCodeAction(...args: Parameters<typeof requestRegistrationCode>) {
  return run(async () => {
    return requestRegistrationCode(...args);
  });
}
export async function registerMemberAction(...args: Parameters<typeof registerMember>) {
  return run(async () => {
    return registerMember(...args);
  });
}
export async function requestLoginCodeAction(...args: Parameters<typeof requestLoginCode>) {
  return run(async () => {
    return requestLoginCode(...args);
  });
}
export async function loginWithPhoneAction(...args: Parameters<typeof loginWithPhone>) {
  return run(async () => {
    return loginWithPhone(...args);
  });
}
export async function verifyIdentityAction(...args: Parameters<typeof verifyIdentity>) {
  return run(async () => {
    return verifyIdentity(...args);
  });
}
export async function joinCreatorsAction(...args: Parameters<typeof joinCreators>) {
  return run(async () => {
    return joinCreators(...args);
  });
}
export async function moderateAction(...args: Parameters<typeof moderate>) {
  return run(async () => {
    return moderate(...args);
  });
}
export async function startReviewAction(...args: Parameters<typeof startReview>) {
  return run(async () => {
    return startReview(...args);
  });
}
export async function setReviewChecklistAction(...args: Parameters<typeof setReviewChecklist>) {
  return run(async () => {
    return setReviewChecklist(...args);
  });
}
export async function logReviewCallAction(...args: Parameters<typeof logReviewCall>) {
  return run(async () => {
    return logReviewCall(...args);
  });
}
export async function importCollectiveMembersAction(...args: Parameters<typeof importCollectiveMembers>) {
  return run(async () => {
    return importCollectiveMembers(...args);
  });
}
export async function importOrganizationStaffAction(...args: Parameters<typeof importOrganizationStaff>) {
  return run(async () => {
    return importOrganizationStaff(...args);
  });
}
export async function setUserStatusAction(...args: Parameters<typeof setUserStatus>) {
  return run(async () => {
    return setUserStatus(...args);
  });
}
export async function setUserRolesAction(...args: Parameters<typeof setUserRoles>) {
  return run(async () => {
    return setUserRoles(...args);
  });
}
export async function deleteOpeningAction(...args: Parameters<typeof deleteOpening>) {
  return run(async () => {
    return deleteOpening(...args);
  });
}
export async function saveCompetitionAction(...args: Parameters<typeof saveCompetition>) {
  return run(async () => {
    return saveCompetition(...args);
  });
}
export async function saveFestivalAction(...args: Parameters<typeof saveFestival>) {
  return run(async () => {
    return saveFestival(...args);
  });
}
export async function deleteEventAction(...args: Parameters<typeof deleteEvent>) {
  return run(async () => {
    return deleteEvent(...args);
  });
}
export async function saveNewsAction(...args: Parameters<typeof saveNews>) {
  return run(async () => {
    return saveNews(...args);
  });
}
export async function deleteNewsAction(...args: Parameters<typeof deleteNews>) {
  return run(async () => {
    return deleteNews(...args);
  });
}
export async function saveBannerAction(...args: Parameters<typeof saveBanner>) {
  return run(async () => {
    return saveBanner(...args);
  });
}
export async function deleteBannerAction(...args: Parameters<typeof deleteBanner>) {
  return run(async () => {
    return deleteBanner(...args);
  });
}
export async function saveReferenceAction(...args: Parameters<typeof saveReference>) {
  return run(async () => {
    return saveReference(...args);
  });
}
export async function deleteReferenceAction(...args: Parameters<typeof deleteReference>) {
  return run(async () => {
    return deleteReference(...args);
  });
}
export async function saveSystemSettingsAction(...args: Parameters<typeof saveSystemSettings>) {
  return run(async () => {
    return saveSystemSettings(...args);
  });
}
export async function createBackupAction(...args: Parameters<typeof createBackup>) {
  return run(async () => {
    return createBackup(...args);
  });
}
