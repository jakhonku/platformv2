import type { LocaleCode } from "../types/common.ts";
import type { Requirements } from "../types/opportunity.ts";
import { instrumentById, regionById, voiceTypeById } from "./constants/index.ts";
import { localized } from "./localized.ts";

export type RequirementRow = {
  key: "kinds" | "instruments" | "voices" | "regions" | "experience";
  values: string[];
};

const names = (ids: string[] | undefined, find: (id: string) => { name: Record<LocaleCode, string> } | undefined, locale: LocaleCode): string[] =>
  (ids ?? []).flatMap((id) => {
    const item = find(id);
    return item ? [localized(item.name, locale)] : [];
  });

/** Talablarni ko'rsatishga tayyor qatorlarga aylantiradi; bo'sh va noma'lum qiymatlar tashlanadi */
export function requirementRows(req: Requirements, locale: LocaleCode): RequirementRow[] {
  const rows: RequirementRow[] = [
    { key: "kinds", values: req.kinds ?? [] },
    { key: "instruments", values: names(req.instrumentIds, instrumentById, locale) },
    { key: "voices", values: names(req.voiceTypeIds, voiceTypeById, locale) },
    { key: "regions", values: names(req.regionIds, regionById, locale) },
    { key: "experience", values: req.minExperience && req.minExperience > 0 ? [String(req.minExperience)] : [] },
  ];
  return rows.filter((r) => r.values.length > 0);
}
