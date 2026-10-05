export const LISTING_KEYS = ["castings", "vacancies", "competitions", "festivals", "projects", "news", "education"] as const;

export type ListingKey = (typeof LISTING_KEYS)[number];

/** Locale prefiksisiz ro'yxat yo'li */
export const listingHref = (key: ListingKey): string => `/${key}`;
