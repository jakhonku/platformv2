import { useTranslations } from "next-intl";

export function ResultsCount({ total }: { total: number }) {
  const t = useTranslations("catalog");
  return (
    <p aria-live="polite" className="text-sm text-muted-foreground">
      {t("results", { count: total })}
    </p>
  );
}
