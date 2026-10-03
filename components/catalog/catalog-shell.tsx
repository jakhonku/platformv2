import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CatalogKey } from "@/lib/catalog-keys";
import { CatalogHeader } from "./catalog-header";
import { CatalogTabs } from "./catalog-tabs";
import { FilterDrawer } from "./filter-drawer";

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Barcha kataloglar uchun umumiy karkas: sarlavha, tablar, yon panel (desktop) / drawer (mobil),
 * asboblar paneli va natijalar. `panel` ikki joyda (yon panel va drawer) chiziladi.
 */
export function CatalogShell({
  active,
  title,
  description,
  panel,
  activeCount,
  toolbar,
  children,
}: {
  active: CatalogKey;
  title: string;
  description?: string;
  panel: React.ReactNode;
  activeCount: number;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-3 py-8 sm:px-6">
      <CatalogHeader title={title} description={description} />
      <CatalogTabs active={active} />
      <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Suspense fallback={<PanelSkeleton />}>{panel}</Suspense>
        </aside>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterDrawer activeCount={activeCount}>
              <Suspense fallback={<PanelSkeleton />}>{panel}</Suspense>
            </FilterDrawer>
            <div className="ml-auto flex flex-wrap items-center gap-3">{toolbar}</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
