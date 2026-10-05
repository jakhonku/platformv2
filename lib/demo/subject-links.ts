import { collective as collectiveRoute, organization as organizationRoute, talent as talentRoute } from "../routes.ts";
import type { DemoSubject } from "./subject.ts";

/** Foydalanuvchining ommaviy sahifasi (iqtidor/jamoa/tashkilot); yo'q bo'lsa `null` */
export function publicProfileHref(subject: DemoSubject): string | null {
  if (subject.talent) return talentRoute(subject.talent.kind, subject.talent.slug);
  if (subject.collective) return collectiveRoute(subject.collective.type, subject.collective.slug);
  if (subject.organization) return organizationRoute(subject.organization.slug);
  return null;
}

/** Profil rasmi (iqtidor fotosi yoki jamoa/tashkilot logotipi) */
export function subjectPhotoUrl(subject: DemoSubject): string | undefined {
  return subject.talent?.photoUrl ?? subject.collective?.logoUrl ?? subject.organization?.logoUrl;
}

/** `setAvatar` uchun egasi */
export function avatarOwner(subject: DemoSubject): { type: "talent" | "collective" | "organization"; id: string } | null {
  if (subject.talent) return { type: "talent", id: subject.talent.id };
  if (subject.collective) return { type: "collective", id: subject.collective.id };
  if (subject.organization) return { type: "organization", id: subject.organization.id };
  return null;
}
