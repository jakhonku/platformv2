import { useLocale, useTranslations } from "next-intl";
import { requirementRows } from "@/lib/requirements";
import type { LocaleCode } from "@/types/common";
import type { Requirements } from "@/types/opportunity";

export function RequirementsList({ requirements }: { requirements: Requirements }) {
  const t = useTranslations("opportunity.requirement");
  const tk = useTranslations("labels.talentKind");
  const locale = useLocale() as LocaleCode;
  const rows = requirementRows(requirements, locale);
  if (rows.length === 0) return null;

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.key} className="glass min-w-0 rounded-2xl p-4">
          <dt className="text-xs text-muted-foreground">{t(row.key)}</dt>
          <dd className="mt-1 break-words text-sm font-medium">
            {row.key === "experience"
              ? t("experienceValue", { count: Number(row.values[0]) })
              : row.key === "kinds"
                ? row.values.map((v) => tk(v as never)).join(", ")
                : row.values.join(", ")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
