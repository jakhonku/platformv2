export type Contact = { channel: "phone" | "email"; value: string };

export const OTP_LENGTH = 6;
export const DEMO_OTP = "123456";
export const MAX_OTP_ATTEMPTS = 5;

const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

const digits = (s: string): string => s.replace(/\D/g, "");

function groups(local: string): string {
  const parts = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 7), local.slice(7, 9)].filter(Boolean);
  return parts.length ? `+998 ${parts.join(" ")}` : "";
}

/** Faqat 9 xonali mahalliy raqam (998 prefiksi olib tashlangan); noto'g'ri bo'lsa null */
export function localPhone(input: string): string | null {
  const d = digits(input);
  if (d.length === 9) return d;
  if (d.length === 12 && d.startsWith("998")) return d.slice(3);
  return null;
}

export function parseContact(input: string): Contact | null {
  const v = input.trim();
  if (EMAIL.test(v)) return { channel: "email", value: v.toLowerCase() };
  const local = localPhone(v);
  return local ? { channel: "phone", value: groups(local) } : null;
}

/** Kiritishni progressiv `+998 XX XXX XX XX` ko'rinishiga keltiradi */
export function formatPhoneInput(raw: string): string {
  let d = digits(raw);
  if ((raw.trim().startsWith("+") || d.length > 9) && d.startsWith("998")) d = d.slice(3);
  return groups(d.slice(0, 9));
}

/** OTP kiritishidan faqat raqamlarni (6 tagacha) qoldiradi */
export function sanitizeOtp(raw: string): string {
  return digits(raw).slice(0, OTP_LENGTH);
}
