import assert from "node:assert/strict";
import { test } from "node:test";
import { CATEGORIES, INSTRUMENTS, REGIONS, VOICE_TYPES } from "../constants/index.ts";
import {
  APPLICATIONS,
  CASTINGS,
  COMPETITIONS,
  FESTIVALS,
  MASTERCLASSES,
  MOCK_NOW,
  NEWS,
  ORGANIZATIONS,
  PROJECTS,
  TALENTS,
  VACANCIES,
} from "./index.ts";

const orgIds = new Set(ORGANIZATIONS.map((o) => o.id));
const talentIds = new Set(TALENTS.map((t) => t.id));
const regionIds = new Set(REGIONS.map((r) => r.id));

test("minimum counts", () => {
  assert.equal(CASTINGS.length, 12);
  assert.equal(VACANCIES.length, 10);
  assert.ok(APPLICATIONS.length >= 20);
  assert.ok(COMPETITIONS.length >= 1 && FESTIVALS.length >= 1);
  assert.ok(COMPETITIONS.length + FESTIVALS.length >= 6);
  assert.equal(PROJECTS.length, 8);
  assert.equal(NEWS.length, 12);
  assert.ok(MASTERCLASSES.length >= 6);
});

test("castings and vacancies reference valid organizations and requirements", () => {
  const instr = new Set(INSTRUMENTS.map((i) => i.id));
  const voices = new Set<string>(VOICE_TYPES.map((v) => v.id));
  for (const x of [...CASTINGS, ...VACANCIES]) {
    assert.ok(orgIds.has(x.organizationId), x.id);
    for (const id of x.requirements.instrumentIds ?? []) assert.ok(instr.has(id), `${x.id} instrument ${id}`);
    for (const id of x.requirements.voiceTypeIds ?? []) assert.ok(voices.has(id), `${x.id} voice ${id}`);
    for (const id of x.requirements.regionIds ?? []) assert.ok(regionIds.has(id), `${x.id} region`);
  }
  for (const v of VACANCIES) assert.ok(regionIds.has(v.regionId));
});

test("status matches deadline and at least 2 castings are closed", () => {
  for (const x of [...CASTINGS, ...VACANCIES]) {
    assert.equal(x.status, x.deadline < MOCK_NOW ? "closed" : "open", x.id);
  }
  assert.ok(CASTINGS.filter((c) => c.status === "closed").length >= 2);
  assert.ok(CASTINGS.filter((c) => c.status === "open").length >= 6);
  assert.ok(VACANCIES.filter((v) => v.status === "open").length >= 5);
});

test("applications reference one valid target and a valid talent; pairs are unique", () => {
  const castingIds = new Set(CASTINGS.map((c) => c.id));
  const vacancyIds = new Set(VACANCIES.map((v) => v.id));
  const pairs = new Set<string>();
  for (const a of APPLICATIONS) {
    assert.ok(talentIds.has(a.talentId), a.id);
    assert.equal(Number(Boolean(a.castingId)) + Number(Boolean(a.vacancyId)), 1, a.id);
    if (a.castingId) assert.ok(castingIds.has(a.castingId));
    if (a.vacancyId) assert.ok(vacancyIds.has(a.vacancyId));
    const key = `${a.talentId}|${a.castingId ?? a.vacancyId}`;
    assert.ok(!pairs.has(key), `duplicate ${key}`);
    pairs.add(key);
    assert.equal(a.history.at(-1)?.status, a.status);
    assert.equal(a.history[0].status, "submitted");
  }
});

test("all six application statuses occur", () => {
  const seen = new Set(APPLICATIONS.map((a) => a.status));
  for (const s of ["submitted", "viewed", "shortlisted", "invited", "rejected", "accepted"]) {
    assert.ok(seen.has(s as never), s);
  }
});

test("events, projects, news and master classes reference valid data and have unique slugs", () => {
  const eventCategories = new Set(CATEGORIES.filter((c) => c.kind === "event").map((c) => c.id));
  const newsCategories = new Set(CATEGORIES.filter((c) => c.kind === "news").map((c) => c.id));
  for (const e of [...COMPETITIONS, ...FESTIVALS]) {
    assert.ok(regionIds.has(e.regionId));
    if (e.organizerId) assert.ok(orgIds.has(e.organizerId));
    assert.ok(e.startDate <= e.endDate, e.slug);
  }
  for (const c of COMPETITIONS) assert.ok(eventCategories.has(c.categoryId));
  for (const n of NEWS) assert.ok(newsCategories.has(n.categoryId), n.slug);
  for (const p of PROJECTS) for (const id of p.talentIds) assert.ok(talentIds.has(id), p.slug);
  for (const m of MASTERCLASSES) assert.ok(talentIds.has(m.teacherId), m.slug);
  for (const list of [[...COMPETITIONS, ...FESTIVALS], PROJECTS, NEWS, MASTERCLASSES]) {
    assert.equal(new Set(list.map((x) => x.slug)).size, list.length);
    assert.equal(new Set(list.map((x) => x.id)).size, list.length);
  }
});

test("news is ordered newest first", () => {
  for (let i = 1; i < NEWS.length; i++) assert.ok(NEWS[i - 1].publishedAt > NEWS[i].publishedAt);
});

test("Uzbek content uses no ASCII apostrophes", () => {
  const texts = [
    ...CASTINGS.flatMap((x) => [x.title, x.description, x.location]),
    ...VACANCIES.flatMap((x) => [x.title, x.description]),
    ...APPLICATIONS.map((a) => a.message),
    ...[...COMPETITIONS, ...FESTIVALS].flatMap((e) => [e.title, e.description]),
    ...PROJECTS.flatMap((p) => [p.title, p.description]),
    ...NEWS.flatMap((n) => [n.title, n.excerpt, n.body]),
    ...MASTERCLASSES.flatMap((m) => [m.title, m.description]),
  ];
  for (const s of texts) assert.doesNotMatch(s, /[OoGg]'/, s);
});
