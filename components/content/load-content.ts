import { cache } from "react";
import { getMasterClassBySlug, getNewsBySlug, getProjectBySlug } from "@/lib/data";

/** Sahifa va generateMetadata bir so'rovda bir xil yozuvni so'raydi: React cache bilan bitta chaqiruv */
export const loadProject = cache((slug: string) => getProjectBySlug(slug));
export const loadNews = cache((slug: string) => getNewsBySlug(slug));
export const loadMasterClass = cache((slug: string) => getMasterClassBySlug(slug));
