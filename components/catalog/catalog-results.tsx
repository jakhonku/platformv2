import { useTranslations } from "next-intl";
import { CardSkeletons } from "@/components/layout/card-skeletons";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export const CARD_GRID = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

export function ResultsSkeleton({ list = false }: { list?: boolean }) {
  return list ? (
    <div className="flex flex-col gap-3">
      <CardSkeletons count={6} />
    </div>
  ) : (
    <div className={CARD_GRID}>
      <CardSkeletons count={6} />
    </div>
  );
}

/** Natija bo'sh: tushuntirish + filtrlarni tozalash havolasi */
export function NoResults({ basePath }: { basePath: string }) {
  const t = useTranslations("catalog");
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full">
        <EmptyState title={t("emptyTitle")} text={t("emptyText")} />
      </div>
      <Button nativeButton={false} variant="outline" render={<Link href={basePath} />}>
        {t("reset")}
      </Button>
    </div>
  );
}

/** Server tomonda ishga tushirilgan promise rad etilsa, Node jarayonini yiqitmasligi uchun */
export function started<T>(promise: Promise<T>): Promise<T> {
  promise.catch(() => undefined);
  return promise;
}
