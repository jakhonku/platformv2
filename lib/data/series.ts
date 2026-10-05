import { MOCK_NOW } from "../mock/now.ts";
import { createRng } from "../mock/random.ts";

export type WeeklyPoint = { /** Hafta boshi (dushanba), YYYY-MM-DD */ week: string; views: number };

const DAY_MS = 86_400_000;

/**
 * Oxirgi `count` hafta uchun deterministik ko'rishlar: `total` og'irliklar bilan haftalarga bo'linadi
 * (yig'indi aynan `total`). Oxirgi hafta — "bugun"ni o'z ichiga olgan hafta.
 */
export function weeklySeries(total: number, seed: number, count = 12): WeeklyPoint[] {
  const now = new Date(MOCK_NOW);
  const mondayOffset = (now.getUTCDay() + 6) % 7;
  const lastMonday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - mondayOffset * DAY_MS;
  const rng = createRng(seed);
  const weights = Array.from({ length: count }, (_, i) => rng.int(10, 13) + Math.round(i / 2));
  const sum = weights.reduce((a, b) => a + b, 0);
  const points = weights.map((w, i) => ({
    week: new Date(lastMonday - (count - 1 - i) * 7 * DAY_MS).toISOString().slice(0, 10),
    views: Math.floor((total * w) / sum),
  }));
  points[count - 1].views += total - points.reduce((n, p) => n + p.views, 0);
  return points;
}

/** Oxirgi 3 oylik yig'indi (haftalik qatorning umumiy yig'indisi shunga teng) */
export const lastQuarter = (monthly: { views: number }[]): number => monthly.slice(-3).reduce((n, m) => n + m.views, 0);
