export const CATALOG_KEYS = ["musicians", "vocalists", "conductors", "composers", "orchestras", "choirs", "organizations"] as const;

export type CatalogKey = (typeof CATALOG_KEYS)[number];

/** Locale prefiksisiz katalog yo'li */
export const catalogHref = (key: CatalogKey): string => `/${key}`;
