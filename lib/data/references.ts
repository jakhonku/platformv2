import type { Category, Instrument, Region, VoiceType } from "../../types/reference.ts";
import { simulateLatency } from "./latency.ts";
import { store } from "./store.ts";
import { clone } from "./text.ts";

export type References = {
  regions: Region[];
  instruments: Instrument[];
  voiceTypes: VoiceType[];
  categories: Category[];
};

export async function getReferences(): Promise<References> {
  await simulateLatency();
  return clone({ ...store.references });
}
