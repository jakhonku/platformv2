import { cache } from "react";
import { getTalentBySlug } from "@/lib/data";

/** Sahifa va generateMetadata bir so'rovda bir xil profilni so'raydi: React cache bilan bitta chaqiruv */
export const loadTalent = cache((slug: string) => getTalentBySlug(slug));
