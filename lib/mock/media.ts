import type { Collection, MediaItem, MediaType } from "../../types/media.ts";
import { createRng, randomDate } from "./random.ts";
import { TALENTS } from "./talents.ts";

const rng = createRng(8080);

/** Haqiqiy video emas: o'yin uchun 11 belgili joy egasi ID'lar (pleyer 5-bosqichda "demo" holatini ko'rsatadi) */
const YOUTUBE_PLACEHOLDERS = ["PLACEHOLD01", "PLACEHOLD02", "PLACEHOLD03", "PLACEHOLD04", "PLACEHOLD05", "PLACEHOLD06"];
const TYPES: MediaType[] = ["video", "audio", "document", "score", "midi"];

const SAMPLE_URL: Record<Exclude<MediaType, "video">, string> = {
  audio: "/samples/sample.wav",
  document: "/samples/sample.pdf",
  score: "/samples/sample-score.pdf",
  midi: "/samples/sample.mid",
};

const TITLE: Record<MediaType, (rep: string) => string> = {
  video: (rep) => `Konsert yozuvi — ${rep}`,
  audio: (rep) => `Studiya yozuvi — ${rep}`,
  document: () => "Diplom va sertifikatlar",
  score: (rep) => `Partitura: ${rep}`,
  midi: (rep) => `MIDI aranjirovka: ${rep}`,
};

const DESCRIPTION: Record<MediaType, string> = {
  video: "Jonli ijro yozuvi: sahna va akustika tabiiy holatda saqlangan.",
  audio: "Yuqori sifatli studiya yozuvi, qayta ishlovsiz.",
  document: "Taʼlim va qatnashgan tanlovlar haqidagi hujjatlar skani.",
  score: "Asarning toʻliq notalari (PDF).",
  midi: "Moslashtirilgan MIDI fayl, DAW dasturlarida ochiladi.",
};

let counter = 0;

export const MEDIA: MediaItem[] = TALENTS.flatMap((t, i) => {
  const count = 1 + (i % 4);
  return Array.from({ length: count }, (_, k): MediaItem => {
    const type = TYPES[(i + k) % TYPES.length];
    const n = counter++;
    const rep = t.repertoire[k % t.repertoire.length];
    const moderation = t.moderation === "pending" ? "pending" : n % 11 === 5 ? "rejected" : n % 7 === 3 ? "pending" : "approved";
    const isStream = type === "video";
    const ytId = YOUTUBE_PLACEHOLDERS[n % YOUTUBE_PLACEHOLDERS.length];
    return {
      id: `media-${String(n + 1).padStart(3, "0")}`,
      ownerId: t.id,
      ownerType: "talent",
      type,
      title: TITLE[type](rep),
      description: DESCRIPTION[type],
      url: isStream ? `https://www.youtube.com/watch?v=${ytId}` : SAMPLE_URL[type as Exclude<MediaType, "video">],
      youtubeId: isStream ? ytId : undefined,
      durationSec: type === "video" || type === "audio" ? rng.int(120, 900) : undefined,
      moderation,
      views: rng.int(20, 5000),
      createdAt: randomDate(rng),
    };
  });
});

export const COLLECTIONS: Collection[] = TALENTS.flatMap((t) => {
  const approved = MEDIA.filter((m) => m.ownerId === t.id && m.moderation === "approved");
  if (approved.length < 2) return [];
  return [
    {
      id: `collection-${t.id}`,
      ownerId: t.id,
      title: "Tanlangan ijrolar",
      description: "Eng yaxshi chiqishlar va yozuvlar toʻplami.",
      itemIds: approved.map((m) => m.id),
    },
  ];
});
