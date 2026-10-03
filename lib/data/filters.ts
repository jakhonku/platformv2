import { z } from "zod";
import { DataError } from "./errors.ts";

const text = z.string().trim().max(100).optional();
const bool = z.preprocess(
  (v) => (v === "true" || v === true ? true : v === "false" || v === false ? false : v === "" ? undefined : v),
  z.boolean().optional(),
);
const num = z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().int().min(0).max(100).optional());

const talentKind = z.enum(["musician", "vocalist", "conductor", "composer"]);
const availability = z.enum(["available", "busy", "open_to_offers"]);
const status = z.enum(["open", "closed"]);

export const talentFiltersSchema = z.object({
  kind: talentKind.optional(),
  q: text,
  instrumentId: text,
  voiceTypeId: text,
  specialty: text,
  regionId: text,
  city: text,
  education: text,
  minExperience: num,
  collectiveId: text,
  availability: availability.optional(),
  verified: bool,
  sort: z.enum(["name", "experience", "recent"]).optional(),
});

export const collectiveFiltersSchema = z.object({
  type: z.enum(["orchestra", "choir"]).optional(),
  q: text,
  regionId: text,
  city: text,
  verified: bool,
  sort: z.enum(["name", "founded", "members"]).optional(),
});

export const organizationFiltersSchema = z.object({
  q: text,
  kind: z.enum(["philharmonic", "theatre", "conservatory", "college", "school", "festival_org", "agency"]).optional(),
  regionId: text,
});

export const castingFiltersSchema = z.object({
  q: text,
  organizationId: text,
  status: status.optional(),
  instrumentId: text,
  voiceTypeId: text,
  regionId: text,
  kind: talentKind.optional(),
  sort: z.enum(["deadline", "recent"]).optional(),
});

export const vacancyFiltersSchema = castingFiltersSchema.extend({
  employment: z.enum(["full_time", "part_time", "contract"]).optional(),
});

export const eventFiltersSchema = z.object({
  q: text,
  status: z.enum(["upcoming", "ongoing", "finished"]).optional(),
  regionId: text,
});

export const projectFiltersSchema = z.object({
  q: text,
  status: z.enum(["planned", "active", "completed"]).optional(),
});

export const newsFiltersSchema = z.object({ q: text, categoryId: text });

export const masterClassFiltersSchema = z.object({
  q: text,
  instrumentId: text,
  format: z.enum(["online", "offline"]).optional(),
});

export const userFiltersSchema = z.object({
  q: text,
  role: text,
  status: z.enum(["active", "pending", "blocked"]).optional(),
});

export const applicationPayloadSchema = z.object({
  talentId: z.string().min(1),
  message: z.string().max(2000).optional(),
  mediaIds: z.array(z.string()).max(10).optional(),
});

export const applicationStatusSchema = z.enum(["submitted", "viewed", "shortlisted", "invited", "rejected", "accepted"]);

export type TalentFilters = z.input<typeof talentFiltersSchema>;
export type CollectiveFilters = z.input<typeof collectiveFiltersSchema>;
export type OrganizationFilters = z.input<typeof organizationFiltersSchema>;
export type CastingFilters = z.input<typeof castingFiltersSchema>;
export type VacancyFilters = z.input<typeof vacancyFiltersSchema>;
export type EventFilters = z.input<typeof eventFiltersSchema>;
export type ProjectFilters = z.input<typeof projectFiltersSchema>;
export type NewsFilters = z.input<typeof newsFiltersSchema>;
export type MasterClassFilters = z.input<typeof masterClassFiltersSchema>;
export type UserFilters = z.input<typeof userFiltersSchema>;

export function parse<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input ?? {});
  if (!result.success) throw new DataError("invalid", result.error.message);
  return result.data;
}
