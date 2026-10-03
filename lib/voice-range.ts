const SEMITONE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const NOTE = /^([A-G])([#b]?)(-?\d)$/;

/** Shkala: C2 (36) ... C7 (96) */
const SCALE_LOW = 36;
const SCALE_HIGH = 96;

export function parseNote(note: string): number | null {
  const m = NOTE.exec(note);
  if (!m) return null;
  const accidental = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0;
  return (Number(m[3]) + 1) * 12 + SEMITONE[m[1]] + accidental;
}

/** Diapazon chizig'i: shkalaga nisbatan foizlarda; noto'g'ri/teskari/shkaladan tashqari diapazonda `null` */
export function rangeBar(low: string, high: string): { left: number; width: number } | null {
  const lo = parseNote(low);
  const hi = parseNote(high);
  if (lo === null || hi === null || lo > hi) return null;
  const from = Math.max(lo, SCALE_LOW);
  const to = Math.min(hi, SCALE_HIGH);
  if (to <= from) return null;
  const span = SCALE_HIGH - SCALE_LOW;
  return { left: ((from - SCALE_LOW) / span) * 100, width: ((to - from) / span) * 100 };
}
