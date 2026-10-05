import { cache } from "react";
import { getCastingById, getVacancyById } from "@/lib/data";

/** Sahifa va generateMetadata bir so'rovda bir xil e'lonni so'raydi: React cache bilan bitta chaqiruv */
export const loadCasting = cache((id: string) => getCastingById(id));
export const loadVacancy = cache((id: string) => getVacancyById(id));
