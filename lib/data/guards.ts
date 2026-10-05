import "server-only";
import { cookies } from "next/headers";
import { DataError } from "./errors.ts";
import { parseRole, ROLE_COOKIE } from "../demo/role.ts";

/** Faqat platforma admini bajara oladigan amallar uchun (Server Action ichida chaqiriladi) */
export async function assertAdmin(): Promise<void> {
  const role = parseRole((await cookies()).get(ROLE_COOKIE)?.value);
  if (role !== "admin") throw new DataError("forbidden", "Bu amalni faqat platforma administratori bajara oladi");
}
