export type LocaleCode = "uz" | "ru" | "en";
export type LocalizedText = Record<LocaleCode, string>;

/** REST API javob formati (6-bo'lim): { items, total, page, pageSize } */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type PageQuery = {
  page?: number;
  pageSize?: number;
  sort?: string;
  q?: string;
};

export type Availability = "available" | "busy" | "open_to_offers";
export type ModerationStatus = "pending" | "approved" | "rejected";

export type Contacts = {
  phone?: string;
  email?: string;
  telegram?: string;
  website?: string;
};

/** ISO 8601 sana-vaqt satri */
export type IsoDate = string;
