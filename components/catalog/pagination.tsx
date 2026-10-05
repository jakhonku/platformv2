"use client";

import { ChevronLeft, ChevronRight } from "@/components/icons";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buildPageList, totalPages } from "@/lib/catalog-params";
import { cn } from "@/lib/utils";
import { useUrlFilters } from "./use-url-filters";

export function Pagination({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
  const t = useTranslations("catalog.pagination");
  const { hrefFor } = useUrlFilters();
  const pages = totalPages(total, pageSize);
  if (pages <= 1) return null;

  const item = "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors";
  const idle = "glass border-(--glass-border) text-foreground hover:bg-(--glass-hover)";

  return (
    <nav aria-label={t("label")} className="flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={hrefFor({ page: String(page - 1) })} className={cn(item, idle, "gap-1 pr-3")}>
          <ChevronLeft className="size-4" aria-hidden />
          <span className="hidden sm:inline">{t("prev")}</span>
          <span className="sr-only sm:hidden">{t("prev")}</span>
        </Link>
      ) : null}
      {buildPageList(page, pages).map((n, i) =>
        n === "gap" ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={hrefFor({ page: String(n) })}
            aria-label={t("page", { page: n })}
            aria-current={n === page ? "page" : undefined}
            className={cn(item, n === page ? "border-transparent bg-primary text-primary-foreground shadow-sm" : idle)}
          >
            {n}
          </Link>
        ),
      )}
      {page < pages ? (
        <Link href={hrefFor({ page: String(page + 1) })} className={cn(item, idle, "gap-1 pl-3")}>
          <span className="hidden sm:inline">{t("next")}</span>
          <span className="sr-only sm:hidden">{t("next")}</span>
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
