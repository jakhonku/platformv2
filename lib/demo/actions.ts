"use server";

import { cookies } from "next/headers";
import { isDemoEnabled, parseRole, ROLE_COOKIE, type Role } from "./role";

export async function setDemoRole(role: Role): Promise<void> {
  if (!isDemoEnabled()) return;
  const store = await cookies();
  store.set(ROLE_COOKIE, parseRole(role), { path: "/", sameSite: "lax" });
}
