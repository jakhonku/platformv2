import { getLocale, getTranslations } from "next-intl/server";
import { SectionBoundary } from "@/components/home/section-boundary";
import { TalentCard } from "@/components/talent/talent-card";
import { TalentListItem } from "@/components/talent/talent-list-item";
import { redirect } from "@/i18n/navigation";
import { buildQuery, PAGE_SIZE, parseTalentParams, totalPages, type RawParams, type TalentParams } from "@/lib/catalog-params";
import type { CatalogKey } from "@/lib/catalog-keys";
import { getTalents } from "@/lib/data";
import type { Paginated } from "@/types/common";
import type { TalentKind, TalentProfile } from "@/types/talent";
import { CARD_GRID, NoResults, ResultsSkeleton, started } from "./catalog-results";
import { CatalogShell } from "./catalog-shell";
import { FilterPanel } from "./filter-panel";
import { loadCollectiveNames, loadFilterOptions } from "./filter-options";
import { Pagination } from "./pagination";
import { ResultsCount } from "./results-count";
import { SortSelect } from "./sort-select";
import { ViewToggle } from "./view-toggle";

const KEY_BY_KIND: Record<TalentKind, CatalogKey> = {
  musician: "musicians",
  vocalist: "vocalists",
  conductor: "conductors",
  composer: "composers",
};

async function TalentResults({
  promise,
  namesPromise,
  parsed,
  raw,
  basePath,
}: {
  promise: Promise<Paginated<TalentProfile>>;
  namesPromise: Promise<Map<string, string>>;
  parsed: TalentParams;
  raw: RawParams;
  basePath: string;
}) {
  const [res, names, locale] = await Promise.all([promise, namesPromise, getLocale()]);
  const pages = totalPages(res.total, PAGE_SIZE);
  // Sahifa oxirgisidan oshib ketgan bo'lsa (masalan ?page=999) oxirgi sahifaga yo'naltiriladi
  if (res.total > 0 && parsed.page > pages) redirect({ href: `${basePath}${buildQuery(raw, { page: String(pages) })}`, locale });

  if (res.total === 0) return <NoResults basePath={basePath} />;

  return (
    <div className="flex flex-col gap-4">
      <ResultsCount total={res.total} />
      {parsed.view === "list" ? (
        <div className="flex flex-col gap-3">
          {res.items.map((t) => (
            <TalentListItem key={t.id} talent={t} collectiveName={t.currentCollectiveId ? names.get(t.currentCollectiveId) : undefined} />
          ))}
        </div>
      ) : (
        <div className={CARD_GRID}>
          {res.items.map((t) => (
            <TalentCard key={t.id} talent={t} collectiveName={t.currentCollectiveId ? names.get(t.currentCollectiveId) : undefined} />
          ))}
        </div>
      )}
      <Pagination page={res.page} pageSize={res.pageSize} total={res.total} />
    </div>
  );
}

export async function TalentCatalog({ kind, searchParams }: { kind: TalentKind; searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const parsed = parseTalentParams(kind, raw);
  const key = KEY_BY_KIND[kind];
  const basePath = `/${key}`;

  // Barcha so'rovlar bir vaqtda boshlanadi (waterfall yo'q); natijalar Suspense ichida oqim bilan keladi
  const namesPromise = started(loadCollectiveNames());
  const optionsPromise = started(loadFilterOptions(namesPromise));
  const talentsPromise = started(getTalents(parsed.filters, parsed.page, PAGE_SIZE));
  const [t] = await Promise.all([getTranslations("catalog")]);

  return (
    <CatalogShell
      active={key}
      title={t(`title.${key}`)}
      description={t(`description.${key}`)}
      activeCount={parsed.activeCount}
      panel={<FilterPanel kind="talent" talentKind={kind} optionsPromise={optionsPromise} activeCount={parsed.activeCount} />}
      toolbar={
        <>
          <SortSelect options={["name", "experience", "recent"]} value={parsed.sort} />
          <ViewToggle view={parsed.view} />
        </>
      }
    >
      <SectionBoundary key={JSON.stringify([parsed.filters, parsed.page, parsed.view])} fallback={<ResultsSkeleton list={parsed.view === "list"} />}>
        <TalentResults promise={talentsPromise} namesPromise={namesPromise} parsed={parsed} raw={raw} basePath={basePath} />
      </SectionBoundary>
    </CatalogShell>
  );
}
