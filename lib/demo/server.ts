import "server-only";
import { cookies } from "next/headers";
import { parseRole, ROLE_COOKIE, type Role } from "./role";

export async function getDemoRole(): Promise<Role> {
  const store = await cookies();
  return parseRole(store.get(ROLE_COOKIE)?.value);
}
