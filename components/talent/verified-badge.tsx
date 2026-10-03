import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function VerifiedBadge() {
  const t = useTranslations("labels");
  return (
    <span title={t("verified")} className="inline-flex shrink-0 text-primary">
      <BadgeCheck className="size-4" aria-hidden />
      <span className="sr-only">{t("verified")}</span>
    </span>
  );
}
