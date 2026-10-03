import { cache } from "react";
import { getCollectiveBySlug, getOrganizationBySlug } from "@/lib/data";

/** Sahifa va generateMetadata bir so'rovda bir xil ma'lumotni so'raydi: React cache bilan bitta chaqiruv */
export const loadCollective = cache((slug: string) => getCollectiveBySlug(slug));
export const loadOrganization = cache((slug: string) => getOrganizationBySlug(slug));
