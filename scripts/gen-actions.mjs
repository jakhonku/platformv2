// Hosil qiluvchi: `node scripts/gen-actions.mjs` — lib/data/actions.ts va lib/data/client.ts ni qayta yozadi
import fs from "node:fs";
const fns = {
  "./cabinet.ts": ["updateTalentProfile", "addMedia", "updateMedia", "deleteMedia", "createCollection", "deleteCollection", "respondToInvitation", "saveNotificationSettings", "markAllNotificationsRead", "createCasting", "createVacancy", "setOpportunityStatus", "updateCollective", "inviteCollectiveMember", "respondToCollectiveInvite", "addCollectiveMember", "removeCollectiveMember", "addCollectiveEvent", "removeCollectiveEvent"],
  "./opportunities.ts": ["applyToCasting", "applyToVacancy", "updateApplicationStatus"],
  "./invitations.ts": ["sendInvitation"],
  "./account.ts": ["markNotificationRead"],
  "./auth.ts": ["login", "registerAccount", "verifyCode", "verifyAndActivate", "oneIdSignIn"],
  "./admin.ts": ["moderate"],
  "./admin-ops.ts": ["setUserStatus", "setUserRoles", "deleteOpening", "saveCompetition", "saveFestival", "deleteEvent", "saveNews", "deleteNews", "saveBanner", "deleteBanner", "saveReference", "deleteReference", "saveSystemSettings", "createBackup"],
};
let actions = `"use server";

// Mock mutatsiyalar SERVER xotirasida bajariladi: klient komponentlar shu Server Action'lar orqali chaqiradi,
// shunda \`router.refresh()\` dan keyin server sahifalari yangi holatni ko'radi. Natija \`ActionResult\` ko'rinishida
// qaytadi (DataError server chegarasida xabarga aylanib ketmasligi uchun).
import { DataError, type DataErrorCode } from "./errors.ts";
`;
for (const [mod, names] of Object.entries(fns)) actions += `import { ${names.join(", ")} } from "${mod}";\n`;
actions += `
export type ActionResult<T> = { ok: true; data: T } | { ok: false; code: DataErrorCode; message: string };

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof DataError) return { ok: false, code: error.code, message: error.message };
    throw error;
  }
}
`;
let client = `import { DataError } from "./errors.ts";
import type * as cabinet from "./cabinet.ts";
import type * as opportunities from "./opportunities.ts";
import type * as invitations from "./invitations.ts";
import type * as account from "./account.ts";
import type * as auth from "./auth.ts";
import type * as admin from "./admin.ts";
import type * as admin_ops from "./admin-ops.ts";
import * as actions from "./actions.ts";

/** Klient komponentlar uchun: mutatsiyalar Server Action orqali bajariladi, xato \`DataError\` sifatida qaytadi */
async function unwrap<T>(promise: Promise<actions.ActionResult<T>>): Promise<T> {
  const result = await promise;
  if (!result.ok) throw new DataError(result.code, result.message);
  return result.data;
}
`;
for (const [mod, names] of Object.entries(fns)) {
  const ns = mod.replace("./", "").replace(".ts", "").replace(/[^a-zA-Z0-9]/g, "_");
  for (const n of names) {
    actions += `export async function ${n}Action(...args: Parameters<typeof ${n}>) {\n  return run(() => ${n}(...args));\n}\n`;
    client += `export const ${n} = (...args: Parameters<typeof ${ns}.${n}>) => unwrap(actions.${n}Action(...args));\n`;
  }
}
fs.writeFileSync("lib/data/actions.ts", actions);
fs.writeFileSync("lib/data/client.ts", client);
