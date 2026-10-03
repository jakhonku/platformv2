"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { buildSearchHref, SEARCH_TYPES, type SearchType } from "@/lib/search-href";
import { cn } from "@/lib/utils";

export function HeroSearch() {
  const t = useTranslations("home");
  const router = useRouter();
  const [type, setType] = useState<SearchType>("talents");
  const [query, setQuery] = useState("");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + SEARCH_TYPES.length) % SEARCH_TYPES.length;
    setType(SEARCH_TYPES[next]);
    refs.current[next]?.focus();
  }

  return (
    <form
      role="search"
      aria-label={t("searchLabel")}
      onSubmit={(e) => {
        e.preventDefault();
        router.push(buildSearchHref(type, query));
      }}
      className="flex w-full max-w-3xl flex-col gap-3 rounded-2xl border bg-background p-3 shadow-sm sm:p-4"
    >
      <div role="radiogroup" aria-label={t("searchTypeLabel")} className="flex flex-wrap gap-1.5">
        {SEARCH_TYPES.map((value, i) => {
          const active = value === type;
          return (
            <button
              key={value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setType(value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t(`searchTypes.${value}`)}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="h-11 pl-9 text-base"
          />
        </div>
        <Button type="submit" size="lg" className="h-11 px-6">
          {t("searchButton")}
        </Button>
      </div>
    </form>
  );
}
