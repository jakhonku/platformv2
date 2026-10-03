import type { LocaleCode, LocalizedText } from "../types/common.ts";

/** Spravochnik nomini joriy tilda qaytaradi; til bo'sh bo'lsa UZ ga qaytadi */
export function localized(text: LocalizedText, locale: LocaleCode): string {
  return text[locale] || text.uz;
}
