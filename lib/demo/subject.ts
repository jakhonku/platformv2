import type { Collective, Organization } from "../../types/collective.ts";
import type { TalentProfile } from "../../types/talent.ts";
import type { Role } from "./role.ts";

/** Demo rolga mos mock "joriy foydalanuvchi" (haqiqiy auth yo'q) */
export type DemoSubject = {
  role: Role;
  /** Bildirishnomalar uchun mock foydalanuvchi id; jamoa uchun yo'q */
  userId: string | null;
  name: string;
  /** Shaxsi OneID orqali tasdiqlangan (kirgan foydalanuvchi uchun) */
  identityVerified?: boolean;
  phone?: string;
  talent?: TalentProfile;
  collective?: Collective;
  organization?: Organization;
};
