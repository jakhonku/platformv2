import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { CARD_GRID, NoResults, ResultsSkeleton, started } from "@/components/catalog/catalog-results";
import { CatalogShell } from "@/components/catalog/catalog-shell";
import { Pagination } from "@/components/catalog/pagination";
import { ResultsCount } from "@/components/catalog/results-count";
import { SortSelect } from "@/components/catalog/sort-select";
import { SectionBoundary } from "@/components/home/section-boundary";
import { redirect } from "@/i18n/navigation";
import { buildQuery, PAGE_SIZE, totalPages, type RawParams } from "@/lib/catalog-params";
import type { Paginated } from "@/types/common";
import { ListingFilters, type ListingField } from "./listing-filters";

type Props<T> = {
  basePath: string;
  title: string;
  description: string;
  tabs?: ReactNode;
  fields: ListingField[];
  activeCount: number;
  raw: RawParams;
  page: number;
  sort?: { options: string[]; value: string };
  promise: Promise<Paginated<T>>;
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  gridClassName?: string;
};

async function Results<T>({
  promise,
  page,
  raw,
  basePath,
  renderItem,
  getKey,
  gridClassName,
}: Pick<Props<T>, "promise" | "page" | "raw" | "basePath" | "renderItem" | "getKey" | "gridClassName">) {
  const [res, locale] = await Promise.all([promise, getLocale()]);
  const pages = totalPages(res.total, PAGE_SIZE);
  // Sahifa oxirgisidan oshib ketgan bo'lsa (?page=999) oxirgi sahifaga yo'naltiriladi
  if (res.total > 0 && page > pages) redirect({ href: `${basePath}${buildQuery(raw, { page: String(pages) })}`, locale });
  if (res.total === 0) return <NoResults basePath={basePath} />;

  return (
    <div className="flex flex-col gap-4">
      <ResultsCount total={res.total} />
      <div className={gridClassName ?? CARD_GRID}>
        {res.items.map((item) => (
          <div key={getKey(item)} className="min-w-0">
            {renderItem(item)}
          </div>
        ))}
      </div>
      <Pagination page={res.page} pageSize={res.pageSize} total={res.total} />
    </div>
  );
}

/** Ro'yxat sahifalari uchun umumiy karkas: sarlavha, filtrlar, saralash, natijalar, paginatsiya */
export function ListingPage<T>(props: Props<T>) {
  const { title, description, tabs, fields, activeCount, sort, raw } = props;
  const promise = started(props.promise);
  return (
    <CatalogShell
      tabs={tabs}
      title={title}
      description={description}
      activeCount={activeCount}
      panel={<ListingFilters fields={fields} activeCount={activeCount} />}
      toolbar={sort ? <SortSelect options={sort.options} value={sort.value} /> : undefined}
    >
      <SectionBoundary key={JSON.stringify([raw])} fallback={<ResultsSkeleton />}>
        <Results {...props} promise={promise} />
      </SectionBoundary>
    </CatalogShell>
  );
}
