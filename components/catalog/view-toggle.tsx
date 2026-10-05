"use client";

import { LayoutGrid, List } from "@/components/icons";
import { useTranslations } from "next-intl";
import type { View } from "@/lib/catalog-params";
import { cn } from "@/lib/utils";
import { useUrlFilters } from "./use-url-filters";

export function ViewToggle({ view }: { view: View }) {
  const t = useTranslations("catalog.view");
  const { set } = useUrlFilters();
  const options: { value: View; icon: typeof List }[] = [
    { value: "cards", icon: LayoutGrid },
    { value: "list", icon: List },
  ];

  return (
    <div role="group" aria-label={t("label")} className="inline-flex rounded-lg border bg-background p-0.5">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={view === value}
          title={t(value)}
          onClick={() => set({ view: value }, { replace: true })}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            view === value ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
          <span className="sr-only sm:not-sr-only">{t(value)}</span>
        </button>
      ))}
    </div>
  );
}
