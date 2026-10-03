"use client";

import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { buildQuery } from "@/lib/catalog-params";

/**
 * URL — filtrlar uchun yagona holat manbai. Har bir o'zgarish `page` ni birinchi sahifaga qaytaradi.
 * `replace` — tarixni to'ldirmaydi (matn yozish), aks holda `push`.
 */
export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const hrefFor = (patch: Record<string, string | undefined>) => `${pathname}${buildQuery(params, patch)}`;

  return {
    get: (key: string): string => params.get(key) ?? "",
    hrefFor,
    set(patch: Record<string, string | undefined>, opts: { replace?: boolean } = {}) {
      const href = hrefFor(patch);
      if (opts.replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    clear(keys: string[]) {
      router.push(hrefFor(Object.fromEntries(keys.map((k) => [k, undefined]))), { scroll: false });
    },
  };
}
