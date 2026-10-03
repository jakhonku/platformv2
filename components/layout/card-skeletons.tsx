import { Skeleton } from "@/components/ui/skeleton";

/** Kartochka ko'rinishidagi skeletonlar (grid ichida ishlatiladi) */
export function CardSkeletons({ count = 4, media = false }: { count?: number; media?: boolean }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card">
          {media && <Skeleton className="aspect-video w-full rounded-none" />}
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
              {!media && <Skeleton className="size-14 shrink-0 rounded-full" />}
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}
