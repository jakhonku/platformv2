"use client";

import { useTranslations } from "next-intl";
import { SelectField, TextField } from "@/components/catalog/filter-fields";
import { useUrlFilters } from "@/components/catalog/use-url-filters";
import { Button } from "@/components/ui/button";

export type ListingField = {
  param: string;
  type: "text" | "select";
  /** `listing.filters.<labelKey>` */
  labelKey: string;
  options?: { value: string; label: string }[];
};

export function ListingFilters({ fields, activeCount }: { fields: ListingField[]; activeCount: number }) {
  const t = useTranslations("listing.filters");
  const tc = useTranslations("catalog");
  const { clear } = useUrlFilters();

  return (
    <form role="search" aria-label={tc("filtersTitle")} onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{tc("filtersTitle")}</h2>
        {activeCount > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => clear(fields.map((f) => f.param))}>
            {t("reset")}
          </Button>
        )}
      </div>
      {fields.map((f) =>
        f.type === "text" ? (
          <TextField key={f.param} param={f.param} label={t(f.labelKey)} />
        ) : (
          <SelectField key={f.param} param={f.param} label={t(f.labelKey)} anyLabel={t("any")}>
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
        ),
      )}
    </form>
  );
}
