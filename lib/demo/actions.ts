"use server";

import { cookies } from "next/headers";
import { isDemoEnabled, parseRole, ROLE_COOKIE, USER_COOKIE, type Role } from "./role";

const COOKIE_OPTS = { path: "/", sameSite: "lax" as const };

/** Demo rol almashtirgich: demo subyektga qaytadi (kirgan foydalanuvchi cookie'si tozalanadi) */
export async function setDemoRole(role: Role): Promise<void> {
  if (!isDemoEnabled()) return;
  const store = await cookies();
  store.set(ROLE_COOKIE, parseRole(role), COOKIE_OPTS);
  store.delete(USER_COOKIE);
}

/** Mock kirish yakuni: rol va foydalanuvchi id'si (kabinet shu foydalanuvchining yozuvlarini ko'rsatadi) */
export async function signInAs(role: Role, userId?: string): Promise<void> {
  const store = await cookies();
  store.set(ROLE_COOKIE, parseRole(role), COOKIE_OPTS);
  if (userId && /^[\w-]{1,60}$/.test(userId)) store.set(USER_COOKIE, userId, COOKIE_OPTS);
  else store.delete(USER_COOKIE);
}
