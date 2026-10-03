import { getCollectives, getReferences } from "@/lib/data";
import type { FilterOptions } from "./filter-panel";

/** Jamoalar ro'yxati (filtr uchun va kartochkalardagi jamoa nomlari uchun) bir marta so'raladi */
export function loadCollectiveNames(): Promise<Map<string, string>> {
  return getCollectives({}, 1, 100).then((res) => new Map(res.items.map((c) => [c.id, c.name])));
}

export function loadFilterOptions(collectiveNames: Promise<Map<string, string>>): Promise<FilterOptions> {
  return Promise.all([getReferences(), collectiveNames]).then(([refs, names]) => ({
    regions: refs.regions,
    instruments: refs.instruments,
    voiceTypes: refs.voiceTypes,
    collectives: [...names.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, "uz")),
  }));
}
