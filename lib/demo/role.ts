export const ROLES = [
  "guest",
  "member",
  "musician",
  "vocalist",
  "conductor",
  "composer",
  "collective",
  "organization",
  "moderator",
  "admin",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_COOKIE = "demo-role";
export const USER_COOKIE = "demo-user";

export function parseRole(value: string | undefined): Role {
  return (ROLES as readonly string[]).includes(value ?? "") ? (value as Role) : "guest";
}

export function isDemoEnabled(env: { NODE_ENV?: string; NEXT_PUBLIC_DEMO?: string } = process.env): boolean {
  return env.NODE_ENV !== "production" || env.NEXT_PUBLIC_DEMO === "1";
}

const TALENT_KINDS: readonly string[] = ["musician", "vocalist", "conductor", "composer"];

/** Demo rol iqtidor roli bo'lsa, mos iqtidor turini qaytaradi (arizachi shu turdan tanlanadi) */
export function talentKindOfRole(role: Role): "musician" | "vocalist" | "conductor" | "composer" | null {
  return TALENT_KINDS.includes(role) ? (role as "musician" | "vocalist" | "conductor" | "composer") : null;
}
