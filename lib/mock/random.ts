export type Rng = {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(arr: readonly T[]): T;
  chance(p: number): boolean;
  shuffle<T>(arr: readonly T[]): T[];
};

/** mulberry32 — kichik, deterministik PRNG (SSR va hydration bir xil natija olishi uchun) */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min;
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)] as T;
  const chance = (p: number) => next() < p;
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [out[i], out[j]] = [out[j] as T, out[i] as T];
    }
    return out;
  };
  return { next, int, pick, chance, shuffle };
}

/** 2024-01-01 va 2026-09-01 oralig'idagi ISO sana */
export function randomDate(rng: Rng, from = "2024-01-01", to = "2026-09-01"): string {
  const start = Date.parse(from);
  const days = Math.floor((Date.parse(to) - start) / 86400000);
  return new Date(start + rng.int(0, days) * 86400000).toISOString();
}
