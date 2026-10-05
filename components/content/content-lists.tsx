import { getLocale, getTranslations } from "next-intl/server";
import { ListingPage } from "@/components/listing/listing-page";
import type { ListingField } from "@/components/listing/listing-filters";
import { PAGE_SIZE, type RawParams } from "@/lib/catalog-params";
import { CATEGORIES } from "@/lib/constants";
import { getMasterClasses, getNews, getProjects, getReferences, getTalentById } from "@/lib/data";
import { listingHref } from "@/lib/listing-keys";
import { parseMasterClassParams, parseNewsParams, parseProjectParams } from "@/lib/listing-params";
import { localized } from "@/lib/localized";
import type { LocaleCode } from "@/types/common";
import { MasterClassCard } from "./masterclass-card";
import { NewsCard } from "./news-card";
import { ProjectCard } from "./project-card";

async function header(key: "projects" | "news" | "education") {
  const t = await getTranslations("listing");
  return { basePath: listingHref(key), title: t(`title.${key}`), description: t(`description.${key}`) };
}

export async function ProjectList({ searchParams }: { searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const parsed = parseProjectParams(raw);
  const labels = await getTranslations("labels.status");
  const fields: ListingField[] = [
    { param: "q", type: "text", labelKey: "query" },
    { param: "status", type: "select", labelKey: "status", options: (["planned", "active", "completed"] as const).map((s) => ({ value: s, label: labels(s) })) },
  ];
  return (
    <ListingPage
      {...await header("projects")}
      fields={fields}
      activeCount={parsed.activeCount}
      raw={raw}
      page={parsed.page}
      promise={getProjects(parsed.filters, parsed.page, PAGE_SIZE)}
      renderItem={(p) => <ProjectCard project={p} />}
      getKey={(p) => p.id}
    />
  );
}

export async function NewsList({ searchParams }: { searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const parsed = parseNewsParams(raw);
  const locale = (await getLocale()) as LocaleCode;
  const fields: ListingField[] = [
    { param: "q", type: "text", labelKey: "query" },
    {
      param: "category",
      type: "select",
      labelKey: "category",
      options: CATEGORIES.filter((c) => c.kind === "news").map((c) => ({ value: c.id, label: localized(c.name, locale) })),
    },
  ];
  return (
    <ListingPage
      {...await header("news")}
      fields={fields}
      activeCount={parsed.activeCount}
      raw={raw}
      page={parsed.page}
      promise={getNews(parsed.filters, parsed.page, PAGE_SIZE)}
      renderItem={(n) => <NewsCard news={n} />}
      getKey={(n) => n.id}
    />
  );
}

export async function EducationList({ searchParams }: { searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const parsed = parseMasterClassParams(raw);
  const [locale, refs, tf] = await Promise.all([getLocale() as Promise<LocaleCode>, getReferences(), getTranslations("listing.format")]);
  const fields: ListingField[] = [
    { param: "q", type: "text", labelKey: "query" },
    { param: "instrument", type: "select", labelKey: "instrument", options: refs.instruments.map((i) => ({ value: i.id, label: localized(i.name, locale) })) },
    { param: "format", type: "select", labelKey: "format", options: (["online", "offline"] as const).map((f) => ({ value: f, label: tf(f) })) },
  ];
  // O'qituvchi nomlari joriy sahifadagi darslar uchun parallel yuklanadi; topilmasa nom ko'rsatilmaydi
  const promise = getMasterClasses(parsed.filters, parsed.page, PAGE_SIZE).then(async (res) => ({
    ...res,
    items: await Promise.all(res.items.map(async (m) => ({ masterClass: m, teacherName: (await getTalentById(m.teacherId))?.fullName }))),
  }));
  return (
    <ListingPage
      {...await header("education")}
      fields={fields}
      activeCount={parsed.activeCount}
      raw={raw}
      page={parsed.page}
      promise={promise}
      renderItem={(x) => <MasterClassCard masterClass={x.masterClass} teacherName={x.teacherName} />}
      getKey={(x) => x.masterClass.id}
    />
  );
}
