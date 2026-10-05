import "server-only";
import { cookies } from "next/headers";
import { getCollectives, getMediaForOwner, getOrganizations, getSubjectForUser, getTalents } from "@/lib/data";
import type { DemoSubject } from "./subject";
import { parseRole, ROLE_COOKIE, talentKindOfRole, USER_COOKIE, type Role } from "./role";

export async function getDemoRole(): Promise<Role> {
  const store = await cookies();
  return parseRole(store.get(ROLE_COOKIE)?.value);
}

/** Kirgan foydalanuvchining o`z yozuvlari (moderatsiya holatidan qat`i nazar); demo rol almashtirilsa yo`q */
async function getSignedInSubject(role: Role): Promise<DemoSubject | null> {
  const userId = (await cookies()).get(USER_COOKIE)?.value;
  if (!userId) return null;
  const found = await getSubjectForUser(userId);
  if (!found || !found.user.roles.includes(role)) return null;
  const { user, talent, collective, organization } = found;
  const account = { identityVerified: user.identity?.verified === true, phone: user.phone };
  if (role === "member") return { role, userId: user.id, name: user.fullName, ...account };
  if (talent && talentKindOfRole(role)) return { role, userId: user.id, name: talent.fullName, ...account, talent };
  if (collective && role === "collective") return { role, userId: user.id, name: collective.name, ...account, collective };
  if (organization && role === "organization") return { role, userId: user.id, name: organization.name, ...account, organization };
  return null;
}

export type DemoApplicant = { talentId: string; name: string; media: { id: string; title: string }[] };

/** Ariza beruvchi: kirgan foydalanuvchining iqtidor profili yoki demo rolga mos birinchi tasdiqlangan iqtidor */
export async function getDemoApplicant(): Promise<DemoApplicant | null> {
  const subject = await getDemoSubject();
  const talent = subject.talent;
  if (!talent) return null;
  const media = await getMediaForOwner(talent.id);
  return { talentId: talent.id, name: talent.fullName, media: media.map((m) => ({ id: m.id, title: m.title })) };
}

/** Rolga mos mock subyekt: avval kirgan foydalanuvchining yozuvi, aks holda birinchi tasdiqlangan demo subyekt */
export async function getDemoSubject(): Promise<DemoSubject> {
  const role = await getDemoRole();
  const own = await getSignedInSubject(role);
  if (own) return own;
  const kind = talentKindOfRole(role);
  if (kind) {
    const talent = (await getTalents({ kind, verified: true }, 1, 1)).items[0];
    return talent ? { role, userId: talent.userId, name: talent.fullName, talent } : { role, userId: null, name: "" };
  }
  if (role === "collective") {
    const collective = (await getCollectives({}, 1, 1)).items[0];
    return collective ? { role, userId: null, name: collective.name, collective } : { role, userId: null, name: "" };
  }
  if (role === "organization") {
    const organization = (await getOrganizations({}, 1, 1)).items[0];
    return organization
      ? { role, userId: organization.id.replace(/^org-/, "user-org-"), name: organization.name, organization }
      : { role, userId: null, name: "" };
  }
  return { role, userId: null, name: "" };
}

/** Admin harakatlari jurnali uchun mock aktor (demo rolga mos) */
export async function getActorId(): Promise<string> {
  return (await getDemoRole()) === "moderator" ? "user-moderator" : "user-admin";
}
