export const ROLES = [
  "guest",
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

export function parseRole(value: string | undefined): Role {
  return (ROLES as readonly string[]).includes(value ?? "") ? (value as Role) : "guest";
}

export function isDemoEnabled(env: { NODE_ENV?: string; NEXT_PUBLIC_DEMO?: string } = process.env): boolean {
  return env.NODE_ENV !== "production" || env.NEXT_PUBLIC_DEMO === "1";
}
