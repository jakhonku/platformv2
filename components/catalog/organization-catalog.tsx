import { getLocale, getTranslations } from "next-intl/server";
import { OrganizationCard } from "@/components/collective/organization-card";
import { SectionBoundary } from "@/components/home/section-boundary";
import { redirect } from "@/i18n/navigation";
import {
  buildQuery,
  PAGE_SIZE,
  parseOrganizationParams,
  totalPages,
  type OrganizationParams,
  type RawParams,
} from "@/lib/catalog-params";
import { getOrganizations } from "@/lib/data";
import type { Organization } from "@/types/collective";
import type { Paginated } from "@/types/common";
import { CARD_GRID, NoResults, ResultsSkeleton, started } from "./catalog-results";
import { CatalogShell } from "./catalog-shell";
import { loadFilterOptions } from "./filter-options";
import { FilterPanel } from "./filter-panel";
import { Pagination } from "./pagination";
import { ResultsCount } from "./results-count";

async function OrganizationResults({
  promise,
  parsed,
  raw,
}: {
  promise: Promise<Paginated<Organization>>;
  parsed: OrganizationParams;
  raw: RawParams;
}) {
  const basePath = "/organizations";
  const [res, locale] = await Promise.all([promise, getLocale()]);
  const pages = totalPages(res.total, PAGE_SIZE);
  if (res.total > 0 && parsed.page > pages) redirect({ href: `${basePath}${buildQuery(raw, { page: String(pages) })}`, locale });
  if (res.total === 0) return <NoResults basePath={basePath} />;

  return (
    <div className="flex flex-col gap-4">
      <ResultsCount total={res.total} />
      <div className={CARD_GRID}>
        {res.items.map((o) => (
          <OrganizationCard key={o.id} organization={o} />
        ))}
      </div>
      <Pagination page={res.page} pageSize={res.pageSize} total={res.total} />
    </div>
  );
}

export async function OrganizationCatalog({ searchParams }: { searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const parsed = parseOrganizationParams(raw);

  const optionsPromise = started(loadFilterOptions(Promise.resolve(new Map())));
  const promise = started(getOrganizations(parsed.filters, parsed.page, PAGE_SIZE));
  const t = await getTranslations("catalog");

  return (
    <CatalogShell
      active="organizations"
      title={t("title.organizations")}
      description={t("description.organizations")}
      activeCount={parsed.activeCount}
      panel={<FilterPanel kind="organization" optionsPromise={optionsPromise} activeCount={parsed.activeCount} />}
    >
      <SectionBoundary key={JSON.stringify([parsed.filters, parsed.page])} fallback={<ResultsSkeleton />}>
        <OrganizationResults promise={promise} parsed={parsed} raw={raw} />
      </SectionBoundary>
    </CatalogShell>
  );
}
