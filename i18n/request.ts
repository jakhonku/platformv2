import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as localeParam } from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Proxy sarlavhasi boʻlmasa, [locale] segmentining oʻzidan olinadi (next/root-params)
  const requested = (await requestLocale) ?? (await localeParam());
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return { locale, messages: (await import(`../messages/${locale}.json`)).default };
});
