import type { Collective, Organization } from "../../types/collective.ts";
import type { Application, Casting, Vacancy } from "../../types/opportunity.ts";
import type { MediaItem } from "../../types/media.ts";
import type { TalentProfile } from "../../types/talent.ts";
import type { AuditLogEntry, Notification } from "../../types/system.ts";
import type { User } from "../../types/user.ts";
import {
  APPLICATIONS,
  AUDIT_LOG,
  CASTINGS,
  CHOIRS,
  COLLECTIONS,
  MEDIA,
  NOTIFICATIONS,
  ORCHESTRAS,
  ORGANIZATIONS,
  TALENTS,
  USERS,
  VACANCIES,
} from "../mock/index.ts";
import { clone } from "./text.ts";

/**
 * Mutatsiyalar uchun modul xotirasi. Mock massivlarning nusxasi: asl mock hech qachon o'zgarmaydi.
 * Backend ulanganda shu fayl va lib/data/* ichidagi chaqiruvlar fetch('/api/...') ga almashtiriladi.
 */
export const store = {
  users: clone(USERS) as User[],
  talents: clone(TALENTS) as TalentProfile[],
  collectives: clone([...ORCHESTRAS, ...CHOIRS]) as Collective[],
  organizations: clone(ORGANIZATIONS) as Organization[],
  castings: clone(CASTINGS) as Casting[],
  vacancies: clone(VACANCIES) as Vacancy[],
  applications: clone(APPLICATIONS) as Application[],
  media: clone(MEDIA) as MediaItem[],
  collections: clone(COLLECTIONS),
  notifications: clone(NOTIFICATIONS) as Notification[],
  audit: clone(AUDIT_LOG) as AuditLogEntry[],
};
