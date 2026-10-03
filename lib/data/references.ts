import type { Category, Instrument, Region, VoiceType } from "../../types/reference.ts";
import { CATEGORIES, INSTRUMENTS, REGIONS, VOICE_TYPES } from "../constants/index.ts";
import { simulateLatency } from "./latency.ts";
import { clone } from "./text.ts";

export type References = {
  regions: Region[];
  instruments: Instrument[];
  voiceTypes: VoiceType[];
  categories: Category[];
};

export async function getReferences(): Promise<References> {
  await simulateLatency();
  return clone({
    regions: [...REGIONS],
    instruments: [...INSTRUMENTS],
    voiceTypes: [...VOICE_TYPES],
    categories: [...CATEGORIES],
  });
}
