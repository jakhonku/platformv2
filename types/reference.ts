import type { LocalizedText } from "./common.ts";

export type InstrumentFamily = "symphonic" | "folk" | "jazz" | "keyboard" | "percussion";

export type Instrument = {
  id: string;
  family: InstrumentFamily;
  name: LocalizedText;
};

export type VoiceTypeId = "soprano" | "mezzo-soprano" | "alto" | "tenor" | "baritone" | "bass";

export type VoiceType = {
  id: VoiceTypeId;
  name: LocalizedText;
  /** Ilmiy notatsiya, masalan "C4" */
  range: { low: string; high: string };
};

export type Region = {
  id: string;
  name: LocalizedText;
  cities: string[];
};

export type CategoryKind = "talent" | "news" | "event";

export type Category = {
  id: string;
  kind: CategoryKind;
  name: LocalizedText;
};
