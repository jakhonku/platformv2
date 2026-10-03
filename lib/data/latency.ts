/**
 * Haqiqiy tarmoq kechikishini taqlid qiladi (300–600 ms).
 * DATA_LATENCY_MS o'rnatilgan bo'lsa (masalan testlarda "0") aynan shuncha kutadi.
 */
export function simulateLatency(): Promise<void> {
  const fixed = process.env.DATA_LATENCY_MS;
  const ms = fixed !== undefined && fixed !== "" ? Number(fixed) : 300 + Math.floor(Math.random() * 301);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
