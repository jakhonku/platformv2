import { getLocale, getTranslations } from "next-intl/server";
import { CollectiveCard } from "@/components/collective/collective-card";
import { SectionBoundary } from "@/components/home/section-boundary";
import { redirect } from "@/i18n/navigation";
import {
  buildQuery,
  PAGE_SIZE,
  parseCollectiveParams,
  totalPages,
  type CollectiveParams,
  type RawParams,
} from "@/lib/catalog-params";
import { getCollectives } from "@/lib/data";
import type { Collective, CollectiveType } from "@/types/collective";
import type { Paginated } from "@/types/common";
import { CARD_GRID, NoResults, ResultsSkeleton, started } from "./catalog-results";
import { CatalogShell } from "./catalog-shell";
import { loadFilterOptions } from "./filter-options";
import { FilterPanel } from "./filter-panel";
import { Pagination } from "./pagination";
import { ResultsCount } from "./results-count";
import { SortSelect } from "./sort-select";

async function CollectiveResults({
  promise,
  parsed,
  raw,
  basePath,
}: {
  promise: Promise<Paginated<Collective>>;
  parsed: CollectiveParams;
  raw: RawParams;
  basePath: string;
}) {
  const [res, locale] = await Promise.all([promise, getLocale()]);
  const pages = totalPages(res.total, PAGE_SIZE);
  if (res.total > 0 && parsed.page > pages) redirect({ href: `${basePath}${buildQuery(raw, { page: String(pages) })}`, locale });
  if (res.total === 0) return <NoResults basePath={basePath} />;

  return (
    <div className="flex flex-col gap-4">
      <ResultsCount total={res.total} />
      <div className={CARD_GRID}>
        {res.items.map((c) => (
          <CollectiveCard key={c.id} collective={c} />
        ))}
      </div>
      <Pagination page={res.page} pageSize={res.pageSize} total={res.total} />
    </div>
  );
}

export async function CollectiveCatalog({ type, searchParams }: { type: CollectiveType; searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const parsed = parseCollectiveParams(type, raw);
  const key = type === "orchestra" ? "orchestras" : "choirs";
  const basePath = `/${key}`;

  const optionsPromise = started(loadFilterOptions(Promise.resolve(new Map())));
  const promise = started(getCollectives(parsed.filters, parsed.page, PAGE_SIZE));
  const t = await getTranslations("catalog");

  return (
    <CatalogShell
      active={key}
      title={t(`title.${key}`)}
      description={t(`description.${key}`)}
      activeCount={parsed.activeCount}
      panel={<FilterPanel kind="collective" optionsPromise={optionsPromise} activeCount={parsed.activeCount} />}
      toolbar={<SortSelect options={["name", "founded", "members"]} value={parsed.sort} />}
    >
      <SectionBoundary key={JSON.stringify([parsed.filters, parsed.page])} fallback={<ResultsSkeleton />}>
        <CollectiveResults promise={promise} parsed={parsed} raw={raw} basePath={basePath} />
      </SectionBoundary>
    </CatalogShell>
  );
}
