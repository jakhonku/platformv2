import type { Paginated } from "../../types/common.ts";
import type { Competition, Festival, MasterClass, NewsItem, Project } from "../../types/content.ts";
import { MASTERCLASSES, PROJECTS } from "../mock/index.ts";
import {
  eventFiltersSchema,
  masterClassFiltersSchema,
  newsFiltersSchema,
  parse,
  projectFiltersSchema,
  type EventFilters,
  type MasterClassFilters,
  type NewsFilters,
  type ProjectFilters,
} from "./filters.ts";
import { simulateLatency } from "./latency.ts";
import { paginate } from "./paginate.ts";
import { store } from "./store.ts";
import { clone, matches } from "./text.ts";

async function bySlug<T extends { slug: string }>(list: readonly T[], slug: string): Promise<T | null> {
  await simulateLatency();
  const found = list.find((x) => x.slug === slug);
  return found ? clone(found) : null;
}

async function page<T>(list: T[], p?: number, size?: number): Promise<Paginated<T>> {
  await simulateLatency();
  const result = paginate(list, p, size);
  return { ...result, items: clone(result.items) };
}

export async function getCompetitions(filters: EventFilters = {}, p?: number, size?: number): Promise<Paginated<Competition>> {
  const f = parse(eventFiltersSchema, filters);
  const list = store.competitions.filter((e) => matches(f.q, e.title, e.description) && (!f.status || e.status === f.status) && (!f.regionId || e.regionId === f.regionId));
  return page([...list].sort((a, b) => a.startDate.localeCompare(b.startDate)), p, size);
}
export const getCompetitionBySlug = (slug: string): Promise<Competition | null> => bySlug(store.competitions, slug);

export async function getFestivals(filters: EventFilters = {}, p?: number, size?: number): Promise<Paginated<Festival>> {
  const f = parse(eventFiltersSchema, filters);
  const list = store.festivals.filter((e) => matches(f.q, e.title, e.description) && (!f.status || e.status === f.status) && (!f.regionId || e.regionId === f.regionId));
  return page([...list].sort((a, b) => a.startDate.localeCompare(b.startDate)), p, size);
}
export const getFestivalBySlug = (slug: string): Promise<Festival | null> => bySlug(store.festivals, slug);

export async function getProjects(filters: ProjectFilters = {}, p?: number, size?: number): Promise<Paginated<Project>> {
  const f = parse(projectFiltersSchema, filters);
  const list = PROJECTS.filter((x) => matches(f.q, x.title, x.description) && (!f.status || x.status === f.status));
  return page([...list], p, size);
}
export const getProjectBySlug = (slug: string): Promise<Project | null> => bySlug(PROJECTS, slug);

export async function getNews(filters: NewsFilters = {}, p?: number, size?: number): Promise<Paginated<NewsItem>> {
  const f = parse(newsFiltersSchema, filters);
  const list = store.news.filter((n) => matches(f.q, n.title, n.excerpt) && (!f.categoryId || n.categoryId === f.categoryId));
  return page([...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), p, size);
}
export const getNewsBySlug = (slug: string): Promise<NewsItem | null> => bySlug(store.news, slug);

export async function getMasterClasses(filters: MasterClassFilters = {}, p?: number, size?: number): Promise<Paginated<MasterClass>> {
  const f = parse(masterClassFiltersSchema, filters);
  const list = MASTERCLASSES.filter(
    (m) => matches(f.q, m.title, m.description) && (!f.instrumentId || m.instrumentId === f.instrumentId) && (!f.format || m.format === f.format),
  );
  return page([...list].sort((a, b) => a.date.localeCompare(b.date)), p, size);
}
export const getMasterClassBySlug = (slug: string): Promise<MasterClass | null> => bySlug(MASTERCLASSES, slug);
