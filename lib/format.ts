import type { LocaleCode } from "../types/common.ts";

const TIME_ZONE = "Asia/Tashkent";
const INTL_TAG: Record<LocaleCode, string> = { uz: "uz-UZ", ru: "ru-RU", en: "en-GB" };
const CURRENCY_UNIT: Record<LocaleCode, string> = { uz: "soʻm", ru: "сум", en: "UZS" };
const DAY_MS = 86_400_000;

export function formatDate(iso: string, locale: LocaleCode, style: "short" | "long" = "short"): string {
  return new Intl.DateTimeFormat(INTL_TAG[locale], {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateRange(startIso: string, endIso: string, locale: LocaleCode): string {
  const start = formatDate(startIso, locale);
  const end = formatDate(endIso, locale);
  return start === end ? start : `${start} – ${end}`;
}

export function formatMoneyUzs(amount: number, locale: LocaleCode): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `${new Intl.NumberFormat(INTL_TAG[locale], { maximumFractionDigits: 0 }).format(value)} ${CURRENCY_UNIT[locale]}`;
}

/** Muddatgacha qolgan kunlar (yuqoriga yaxlitlanadi); o'tgan muddat uchun 0 */
export function daysLeft(iso: string, nowIso: string): number {
  return Math.max(0, Math.ceil((Date.parse(iso) - Date.parse(nowIso)) / DAY_MS));
}
