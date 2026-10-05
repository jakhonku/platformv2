import { ROLES, type Role } from "../demo/role.ts";

export const REGISTERABLE_ROLES = ["musician", "vocalist", "conductor", "composer", "collective", "organization"] as const satisfies readonly Role[];

const TWO_FACTOR: readonly Role[] = ["organization", "moderator", "admin"];

export const needsTwoFactor = (role: Role): boolean => TWO_FACTOR.includes(role);

/** Locale prefiksisiz kirish manzili */
export const homeFor = (role: Role): string => (role === "admin" || role === "moderator" ? "/admin" : "/cabinet");

export function parseRegisterRole(value: string | undefined): Role | null {
  return (REGISTERABLE_ROLES as readonly string[]).includes(value ?? "") && (ROLES as readonly string[]).includes(value ?? "") ? (value as Role) : null;
}

/** Faqat ikki bosqichli autentifikatsiya talab qiladigan rol; aks holda null */
export function parseTwoFactorRole(value: string | undefined): Role | null {
  return (ROLES as readonly string[]).includes(value ?? "") && TWO_FACTOR.includes(value as Role) ? (value as Role) : null;
}
