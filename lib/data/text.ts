/** Qidiruv uchun normallashtirish: kichik harf, oʻzbek apostroflari (ʻ ʼ ' ’) olib tashlanadi */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ʻʼ'’`]/g, "")
    .trim();
}

export function matches(q: string | undefined, ...fields: (string | undefined)[]): boolean {
  if (!q || !q.trim()) return true;
  const needle = norm(q);
  return fields.some((f) => f !== undefined && norm(f).includes(needle));
}

export const clone = <T>(value: T): T => structuredClone(value);

export const compareText = (a: string, b: string): number => a.localeCompare(b, "uz");
