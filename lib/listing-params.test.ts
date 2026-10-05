import assert from "node:assert/strict";
import { test } from "node:test";
import { parseEventParams, parseMasterClassParams, parseNewsParams, parseOpportunityParams, parseProjectParams } from "./listing-params.ts";

test("parseOpportunityParams reads valid casting filters", () => {
  const p = parseOpportunityParams("casting", { q: " o'rta ", instrument: "violin", status: "open", region: "bukhara", sort: "recent", page: "2" });
  assert.deepEqual(p.filters, { q: "o'rta", instrumentId: "violin", status: "open", regionId: "bukhara", sort: "recent" });
  assert.equal(p.page, 2);
  assert.equal(p.sort, "recent");
  assert.equal(p.activeCount, 4);
});

test("employment applies to vacancies only", () => {
  assert.equal((parseOpportunityParams("vacancy", { employment: "full_time" }).filters as { employment?: string }).employment, "full_time");
  assert.equal("employment" in parseOpportunityParams("casting", { employment: "full_time" }).filters, false);
});

test("garbage URL is dropped (Review Focus 2)", () => {
  const p = parseOpportunityParams("vacancy", { page: "abc", status: "zzz", sort: "<script>", instrument: "yoq", region: "yoq", employment: "x", kind: "dj", voice: "yoq" });
  assert.equal(p.page, 1);
  assert.equal(p.sort, "deadline");
  assert.equal(p.activeCount, 0);
  assert.deepEqual(p.filters, { sort: "deadline" });
});

test("page is clamped and arrays take the first value", () => {
  for (const page of ["0", "-3", "1e9"]) assert.equal(parseOpportunityParams("casting", { page }).page, 1);
  assert.equal(parseOpportunityParams("casting", { q: ["a", "b"] }).filters.q, "a");
});

test("parseEventParams", () => {
  const p = parseEventParams({ status: "upcoming", region: "bukhara", q: "x" });
  assert.deepEqual(p.filters, { q: "x", status: "upcoming", regionId: "bukhara" });
  assert.equal(p.activeCount, 3);
  assert.equal(parseEventParams({ status: "bad" }).activeCount, 0);
});

test("parseProjectParams and parseNewsParams", () => {
  assert.equal(parseProjectParams({ status: "active" }).filters.status, "active");
  assert.equal(parseProjectParams({ status: "x" }).activeCount, 0);
  assert.equal(parseNewsParams({ category: "concerts" }).filters.categoryId, "concerts");
  assert.equal(parseNewsParams({ category: "yoq" }).filters.categoryId, undefined);
  assert.equal(parseNewsParams({ category: "orchestral" }).filters.categoryId, undefined);
});

test("parseMasterClassParams", () => {
  const p = parseMasterClassParams({ instrument: "violin", format: "online" });
  assert.deepEqual(p.filters, { instrumentId: "violin", format: "online" });
  assert.equal(p.activeCount, 2);
  assert.equal(parseMasterClassParams({ format: "hybrid" }).activeCount, 0);
});
