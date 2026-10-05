import type { User } from "../../types/user.ts";
import { DEMO_OTP, parseContact } from "../auth/contact.ts";
import { needsTwoFactor, REGISTERABLE_ROLES } from "../auth/flow.ts";
import type { Role } from "../demo/role.ts";
import { DataError } from "./errors.ts";
import { simulateLatency } from "./latency.ts";
import { store } from "./store.ts";

const MIN_PASSWORD = 8;
const digits = (s: string): string => s.replace(/\D/g, "");

function findUser(contact: { channel: "phone" | "email"; value: string }): User | undefined {
  return store.users.find((u) => (contact.channel === "email" ? u.email.toLowerCase() === contact.value : digits(u.phone) === digits(contact.value)));
}

/** Mock kirish: parol faqat uzunligi bo'yicha tekshiriladi (haqiqiy autentifikatsiya yo'q) */
export async function login(p: { identifier: string; password: string }): Promise<{ userId: string; role: Role; twoFactor: boolean }> {
  await simulateLatency();
  const contact = parseContact(p.identifier);
  if (!contact || p.password.length < MIN_PASSWORD) throw new DataError("invalid", "Maʼlumotlar notoʻgʻri");
  const user = findUser(contact);
  if (!user) throw new DataError("not_found", "Foydalanuvchi topilmadi");
  if (user.status === "blocked") throw new DataError("forbidden", "Hisob bloklangan");
  const role = user.roles[0] ?? "guest";
  return { userId: user.id, role, twoFactor: needsTwoFactor(role) };
}

export async function registerAccount(p: { role: Role; fullName: string; contact: string; password: string }): Promise<{ userId: string }> {
  await simulateLatency();
  const contact = parseContact(p.contact);
  const name = p.fullName.trim();
  const roleOk = (REGISTERABLE_ROLES as readonly string[]).includes(p.role);
  if (!contact || !roleOk || name.length < 2 || name.length > 80 || p.password.length < MIN_PASSWORD) throw new DataError("invalid", "Maʼlumotlar notoʻgʻri");
  if (findUser(contact)) throw new DataError("duplicate", "Bu kontakt bilan hisob mavjud");
  const user: User = {
    id: `user-new-${String(store.users.length + 1).padStart(3, "0")}`,
    fullName: name,
    phone: contact.channel === "phone" ? contact.value : "",
    email: contact.channel === "email" ? contact.value : "",
    roles: [p.role],
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  return { userId: user.id };
}

/** Mock OTP: faqat demo kod qabul qilinadi */
export async function verifyCode(code: string): Promise<void> {
  await simulateLatency();
  if (code !== DEMO_OTP) throw new DataError("invalid", "Kod notoʻgʻri");
}
