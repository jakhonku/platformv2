import { DataError } from "./errors.ts";
import type * as cabinet from "./cabinet.ts";
import type * as opportunities from "./opportunities.ts";
import type * as invitations from "./invitations.ts";
import type * as account from "./account.ts";
import type * as auth from "./auth.ts";
import * as actions from "./actions.ts";

/** Klient komponentlar uchun: mutatsiyalar Server Action orqali bajariladi, xato `DataError` sifatida qaytadi */
async function unwrap<T>(promise: Promise<actions.ActionResult<T>>): Promise<T> {
  const result = await promise;
  if (!result.ok) throw new DataError(result.code, result.message);
  return result.data;
}
export const updateTalentProfile = (...args: Parameters<typeof cabinet.updateTalentProfile>) => unwrap(actions.updateTalentProfileAction(...args));
export const addMedia = (...args: Parameters<typeof cabinet.addMedia>) => unwrap(actions.addMediaAction(...args));
export const updateMedia = (...args: Parameters<typeof cabinet.updateMedia>) => unwrap(actions.updateMediaAction(...args));
export const deleteMedia = (...args: Parameters<typeof cabinet.deleteMedia>) => unwrap(actions.deleteMediaAction(...args));
export const createCollection = (...args: Parameters<typeof cabinet.createCollection>) => unwrap(actions.createCollectionAction(...args));
export const deleteCollection = (...args: Parameters<typeof cabinet.deleteCollection>) => unwrap(actions.deleteCollectionAction(...args));
export const respondToInvitation = (...args: Parameters<typeof cabinet.respondToInvitation>) => unwrap(actions.respondToInvitationAction(...args));
export const saveNotificationSettings = (...args: Parameters<typeof cabinet.saveNotificationSettings>) => unwrap(actions.saveNotificationSettingsAction(...args));
export const markAllNotificationsRead = (...args: Parameters<typeof cabinet.markAllNotificationsRead>) => unwrap(actions.markAllNotificationsReadAction(...args));
export const createCasting = (...args: Parameters<typeof cabinet.createCasting>) => unwrap(actions.createCastingAction(...args));
export const createVacancy = (...args: Parameters<typeof cabinet.createVacancy>) => unwrap(actions.createVacancyAction(...args));
export const setOpportunityStatus = (...args: Parameters<typeof cabinet.setOpportunityStatus>) => unwrap(actions.setOpportunityStatusAction(...args));
export const updateCollective = (...args: Parameters<typeof cabinet.updateCollective>) => unwrap(actions.updateCollectiveAction(...args));
export const addCollectiveMember = (...args: Parameters<typeof cabinet.addCollectiveMember>) => unwrap(actions.addCollectiveMemberAction(...args));
export const removeCollectiveMember = (...args: Parameters<typeof cabinet.removeCollectiveMember>) => unwrap(actions.removeCollectiveMemberAction(...args));
export const addCollectiveEvent = (...args: Parameters<typeof cabinet.addCollectiveEvent>) => unwrap(actions.addCollectiveEventAction(...args));
export const removeCollectiveEvent = (...args: Parameters<typeof cabinet.removeCollectiveEvent>) => unwrap(actions.removeCollectiveEventAction(...args));
export const applyToCasting = (...args: Parameters<typeof opportunities.applyToCasting>) => unwrap(actions.applyToCastingAction(...args));
export const applyToVacancy = (...args: Parameters<typeof opportunities.applyToVacancy>) => unwrap(actions.applyToVacancyAction(...args));
export const updateApplicationStatus = (...args: Parameters<typeof opportunities.updateApplicationStatus>) => unwrap(actions.updateApplicationStatusAction(...args));
export const sendInvitation = (...args: Parameters<typeof invitations.sendInvitation>) => unwrap(actions.sendInvitationAction(...args));
export const markNotificationRead = (...args: Parameters<typeof account.markNotificationRead>) => unwrap(actions.markNotificationReadAction(...args));
export const login = (...args: Parameters<typeof auth.login>) => unwrap(actions.loginAction(...args));
export const registerAccount = (...args: Parameters<typeof auth.registerAccount>) => unwrap(actions.registerAccountAction(...args));
export const verifyCode = (...args: Parameters<typeof auth.verifyCode>) => unwrap(actions.verifyCodeAction(...args));
