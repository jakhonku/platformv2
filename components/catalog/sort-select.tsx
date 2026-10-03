"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { NativeSelect } from "@/components/ui/native-select";
import { useUrlFilters } from "./use-url-filters";

export function SortSelect({ options, value }: { options: readonly string[]; value: string }) {
  const t = useTranslations("catalog.sort");
  const { set } = useUrlFilters();
  const id = useId();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {t("label")}
      </label>
      <div className="w-44">
        <NativeSelect id={id} value={value} onChange={(e) => set({ sort: e.target.value }, { replace: true })}>
          {options.map((o) => (
            <option key={o} value={o}>
              {t(o)}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
