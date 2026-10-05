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

  const item = "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors";
  const idle = "bg-background text-foreground hover:bg-muted";

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
            className={cn(item, n === page ? "border-primary bg-primary text-primary-foreground" : idle)}
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
