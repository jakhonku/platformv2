import type { Paginated } from "../../types/common.ts";

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

export function paginate<T>(items: readonly T[], page: number = 1, pageSize: number = DEFAULT_PAGE_SIZE): Paginated<T> {
  const n = Math.floor(Number(pageSize));
  const size = Number.isFinite(n) && n >= 1 ? Math.min(MAX_PAGE_SIZE, n) : DEFAULT_PAGE_SIZE;
  const current = Math.max(1, Math.floor(Number(page)) || 1);
  const start = (current - 1) * size;
  return { items: items.slice(start, start + size), total: items.length, page: current, pageSize: size };
}
