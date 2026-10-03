/** Mock "bugun": SSR/hydration bir xil bo'lishi va muddatlar barqaror bo'lishi uchun qat'iy sana */
export const MOCK_NOW = "2026-10-03T09:00:00.000Z";

export const iso = (y: number, m: number, d: number, h = 18): string => new Date(Date.UTC(y, m - 1, d, h, 0)).toISOString();
