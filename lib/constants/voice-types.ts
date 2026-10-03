import type { VoiceType, VoiceTypeId } from "../../types/reference.ts";

const v = (id: VoiceTypeId, uz: string, ru: string, en: string, low: string, high: string): VoiceType => ({
  id,
  name: { uz, ru, en },
  range: { low, high },
});

export const VOICE_TYPES: readonly VoiceType[] = [
  v("soprano", "Soprano", "Сопрано", "Soprano", "C4", "C6"),
  v("mezzo-soprano", "Mezzo-soprano", "Меццо-сопрано", "Mezzo-soprano", "A3", "A5"),
  v("alto", "Alt", "Альт", "Alto", "F3", "F5"),
  v("tenor", "Tenor", "Тенор", "Tenor", "C3", "C5"),
  v("baritone", "Bariton", "Баритон", "Baritone", "A2", "A4"),
  v("bass", "Bas", "Бас", "Bass", "E2", "E4"),
];

export const voiceTypeById = (id: string): VoiceType | undefined => VOICE_TYPES.find((x) => x.id === id);
