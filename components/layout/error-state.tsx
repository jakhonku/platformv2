"use client";

import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

export function ErrorState() {
  const t = useTranslations("common");
  const router = useRouter();
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-10 text-center">
      <TriangleAlert className="size-8 text-destructive" aria-hidden />
      <p className="font-medium">{t("errorTitle")}</p>
      <Button variant="outline" size="sm" onClick={() => router.refresh()}>
        {t("retry")}
      </Button>
    </div>
  );
}
