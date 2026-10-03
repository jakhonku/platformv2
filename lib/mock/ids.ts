export const ORCHESTRA_IDS = Array.from({ length: 8 }, (_, i) => `orchestra-${i + 1}`);
export const CHOIR_IDS = Array.from({ length: 6 }, (_, i) => `choir-${i + 1}`);
/** Tartib: avval orkestrlar, keyin xorlar (dirijyorlarni bog'lash shu tartibga tayanadi) */
export const COLLECTIVE_IDS = [...ORCHESTRA_IDS, ...CHOIR_IDS];
