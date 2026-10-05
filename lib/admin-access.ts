import type { Role } from "./demo/role.ts";

export const ADMIN_SECTIONS = ["dashboard", "users", "appeals", "profiles", "media", "organizations", "collectives", "castings", "competitions", "news", "references", "auditLog", "statistics", "system"] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

const MODERATOR_SECTIONS: readonly AdminSection[] = ["dashboard", "profiles", "media", "organizations", "collectives", "castings"];

/** Admin hamma bo'limni, moderator faqat moderatsiya bo'limlarini ko'radi; boshqa rollar hech narsani */
export function canAccess(role: Role, section: AdminSection): boolean {
  if (role === "admin") return true;
  if (role === "moderator") return MODERATOR_SECTIONS.includes(section);
  return false;
}
