import { getLocale, getTranslations } from "next-intl/server";
import { ListingPage } from "@/components/listing/listing-page";
import type { ListingField } from "@/components/listing/listing-filters";
import { SectionTabs } from "@/components/listing/section-tabs";
import { PAGE_SIZE, type RawParams } from "@/lib/catalog-params";
import { getCompetitions, getFestivals, getReferences } from "@/lib/data";
import { listingHref } from "@/lib/listing-keys";
import { parseEventParams } from "@/lib/listing-params";
import { localized } from "@/lib/localized";
import type { LocaleCode } from "@/types/common";
import { EventCard } from "./event-card";

export async function EventList({ kind, searchParams }: { kind: "competition" | "festival"; searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const parsed = parseEventParams(raw);
  const key = kind === "competition" ? "competitions" : "festivals";
  const [t, labels, locale, refs] = await Promise.all([
    getTranslations("listing"),
    getTranslations("labels.status"),
    getLocale() as Promise<LocaleCode>,
    getReferences(),
  ]);
  const fields: ListingField[] = [
    { param: "q", type: "text", labelKey: "query" },
    { param: "status", type: "select", labelKey: "status", options: (["upcoming", "ongoing", "finished"] as const).map((s) => ({ value: s, label: labels(s) })) },
    { param: "region", type: "select", labelKey: "region", options: refs.regions.map((r) => ({ value: r.id, label: localized(r.name, locale) })) },
  ];
  const common = {
    basePath: listingHref(key),
    title: t(`title.${key}`),
    description: t(`description.${key}`),
    tabs: <SectionTabs group="events" active={key} />,
    fields,
    activeCount: parsed.activeCount,
    raw,
    page: parsed.page,
  };
  return kind === "competition" ? (
    <ListingPage {...common} promise={getCompetitions(parsed.filters, parsed.page, PAGE_SIZE)} renderItem={(e) => <EventCard kind="competition" event={e} />} getKey={(e) => e.id} />
  ) : (
    <ListingPage {...common} promise={getFestivals(parsed.filters, parsed.page, PAGE_SIZE)} renderItem={(e) => <EventCard kind="festival" event={e} />} getKey={(e) => e.id} />
  );
}
