import { cache } from "react";
import { getCompetitionBySlug, getFestivalBySlug } from "@/lib/data";

/** Sahifa va generateMetadata bir so'rovda bir xil tadbirni so`raydi: React cache bilan bitta chaqiruv */
export const loadCompetition = cache((slug: string) => getCompetitionBySlug(slug));
export const loadFestival = cache((slug: string) => getFestivalBySlug(slug));
