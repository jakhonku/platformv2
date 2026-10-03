import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { CatalogKey } from "@/lib/catalog-keys";

export async function catalogMetadata(key: CatalogKey, locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "catalog" });
  const title = t(`title.${key}`);
  const description = t(`description.${key}`);
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/${key}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/${key}`])),
    },
    openGraph: { type: "website", title, description, locale },
  };
}
