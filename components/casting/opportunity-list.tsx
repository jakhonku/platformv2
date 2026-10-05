import { getLocale, getTranslations } from "next-intl/server";
import { ListingPage } from "@/components/listing/listing-page";
import type { ListingField } from "@/components/listing/listing-filters";
import { SectionTabs } from "@/components/listing/section-tabs";
import { PAGE_SIZE, type RawParams } from "@/lib/catalog-params";
import { getCastings, getReferences, getVacancies } from "@/lib/data";
import { listingHref } from "@/lib/listing-keys";
import { parseOpportunityParams } from "@/lib/listing-params";
import { localized } from "@/lib/localized";
import type { LocaleCode } from "@/types/common";
import { CastingCard } from "./casting-card";
import { VacancyCard } from "./vacancy-card";

const KINDS = ["musician", "vocalist", "conductor", "composer"] as const;
const EMPLOYMENT = ["full_time", "part_time", "contract"] as const;

export async function OpportunityList({ kind, searchParams }: { kind: "casting" | "vacancy"; searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const parsed = parseOpportunityParams(kind, raw);
  const key = kind === "casting" ? "castings" : "vacancies";
  const [t, labels, locale, refs] = await Promise.all([
    getTranslations("listing"),
    getTranslations("labels"),
    getLocale() as Promise<LocaleCode>,
    getReferences(),
  ]);

  const fields: ListingField[] = [
    { param: "q", type: "text", labelKey: "query" },
    { param: "kind", type: "select", labelKey: "kind", options: KINDS.map((k) => ({ value: k, label: labels(`talentKind.${k}`) })) },
    { param: "instrument", type: "select", labelKey: "instrument", options: refs.instruments.map((i) => ({ value: i.id, label: localized(i.name, locale) })) },
    { param: "voice", type: "select", labelKey: "voice", options: refs.voiceTypes.map((v) => ({ value: v.id, label: localized(v.name, locale) })) },
    { param: "region", type: "select", labelKey: "region", options: refs.regions.map((r) => ({ value: r.id, label: localized(r.name, locale) })) },
    { param: "status", type: "select", labelKey: "status", options: (["open", "closed"] as const).map((s) => ({ value: s, label: labels(`status.${s}`) })) },
    ...(kind === "vacancy"
      ? [{ param: "employment", type: "select", labelKey: "employment", options: EMPLOYMENT.map((e) => ({ value: e, label: labels(`employment.${e}`) })) } satisfies ListingField]
      : []),
  ];
  const common = {
    basePath: listingHref(key),
    title: t(`title.${key}`),
    description: t(`description.${key}`),
    tabs: <SectionTabs group="opportunities" active={key} />,
    fields,
    activeCount: parsed.activeCount,
    raw,
    page: parsed.page,
    sort: { options: ["deadline", "recent"], value: parsed.sort },
  };

  return kind === "casting" ? (
    <ListingPage {...common} promise={getCastings(parsed.filters, parsed.page, PAGE_SIZE)} renderItem={(c) => <CastingCard casting={c} />} getKey={(c) => c.id} />
  ) : (
    <ListingPage {...common} promise={getVacancies(parsed.filters, parsed.page, PAGE_SIZE)} renderItem={(v) => <VacancyCard vacancy={v} />} getKey={(v) => v.id} />
  );
}
