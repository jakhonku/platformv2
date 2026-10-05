import "server-only";
import { cookies } from "next/headers";
import { getCollectives, getMediaForOwner, getOrganizations, getTalents } from "@/lib/data";
import type { DemoSubject } from "./subject";
import { parseRole, ROLE_COOKIE, talentKindOfRole, type Role } from "./role";

export async function getDemoRole(): Promise<Role> {
  const store = await cookies();
  return parseRole(store.get(ROLE_COOKIE)?.value);
}

export type DemoApplicant = { talentId: string; name: string; media: { id: string; title: string }[] };

/** Demo rolga mos birinchi tasdiqlangan iqtidor (haqiqiy auth 7-bosqichda); iqtidor roli bo'lmasa null */
export async function getDemoApplicant(): Promise<DemoApplicant | null> {
  const kind = talentKindOfRole(await getDemoRole());
  if (!kind) return null;
  const { items } = await getTalents({ kind, verified: true }, 1, 1);
  const talent = items[0];
  if (!talent) return null;
  const media = await getMediaForOwner(talent.id);
  return { talentId: talent.id, name: talent.fullName, media: media.map((m) => ({ id: m.id, title: m.title })) };
}

/** Rolga mos birinchi tasdiqlangan mock subyekt: iqtidor, jamoa yoki tashkilot */
export async function getDemoSubject(): Promise<DemoSubject> {
  const role = await getDemoRole();
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
