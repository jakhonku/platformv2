import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildPageList,
  buildQuery,
  parseCollectiveParams,
  parseOrganizationParams,
  parseTalentParams,
  totalPages,
} from "./catalog-params.ts";

test("parseTalentParams maps URL keys to data filters", () => {
  const r = parseTalentParams("musician", {
    q: " Jasur ",
    instrument: "violin",
    verified: "true",
    exp: "5",
    page: "3",
    view: "list",
  });
  assert.deepEqual(r.filters, {
    kind: "musician",
    q: "Jasur",
    instrumentId: "violin",
    verified: true,
    minExperience: 5,
    sort: "name",
  });
  assert.equal(r.page, 3);
  assert.equal(r.view, "list");
  assert.equal(r.activeCount, 4);
});

test("parseTalentParams drops garbage without throwing (Review Focus 1)", () => {
  const r = parseTalentParams("musician", {
    page: "abc",
    exp: "-5",
    sort: "<script>",
    view: "grid",
    region: "yoq",
    availability: "x",
    verified: "maybe",
    instrument: "yoq",
  });
  assert.equal(r.page, 1);
  assert.equal(r.view, "cards");
  assert.equal(r.sort, "name");
  assert.deepEqual(r.filters, { kind: "musician", sort: "name" });
  assert.equal(r.activeCount, 0);
});

test("city is only kept when it belongs to the selected region (Review Focus 4)", () => {
  assert.equal(parseTalentParams("musician", { city: "Samarqand" }).filters.city, undefined);
  assert.equal(parseTalentParams("musician", { region: "samarkand", city: "Samarqand" }).filters.city, "Samarqand");
  assert.equal(parseTalentParams("musician", { region: "samarkand", city: "Toshkent" }).filters.city, undefined);
});

test("voice filter applies to the vocalist catalog only", () => {
  assert.equal(parseTalentParams("vocalist", { voice: "tenor" }).filters.voiceTypeId, "tenor");
  assert.equal(parseTalentParams("musician", { voice: "tenor" }).filters.voiceTypeId, undefined);
  assert.equal(parseTalentParams("vocalist", { voice: "yoq" }).filters.voiceTypeId, undefined);
});

test("array values use the first entry; page is clamped to >= 1", () => {
  assert.equal(parseTalentParams("composer", { q: ["a", "b"] }).filters.q, "a");
  assert.equal(parseTalentParams("composer", { page: "0" }).page, 1);
  assert.equal(parseTalentParams("composer", { page: "-4" }).page, 1);
});

test("collective and organization params", () => {
  const c = parseCollectiveParams("choir", { q: "xor", region: "tashkent-city", sort: "members", verified: "1" });
  assert.deepEqual(c.filters, { type: "choir", q: "xor", regionId: "tashkent-city", sort: "members", verified: true });
  assert.equal(parseCollectiveParams("orchestra", { sort: "zzz" }).sort, "name");
  const o = parseOrganizationParams({ kind: "theatre", region: "samarkand", q: "x" });
  assert.deepEqual(o.filters, { kind: "theatre", regionId: "samarkand", q: "x" });
  assert.equal(parseOrganizationParams({ kind: "bogus" }).filters.kind, undefined);
});

test("buildQuery resets page, drops empties and defaults, encodes specials", () => {
  assert.equal(buildQuery(new URLSearchParams("q=a&page=3"), { region: "tashkent-city" }), "?q=a&region=tashkent-city");
  assert.equal(buildQuery(new URLSearchParams("q=a&region=x"), { q: "" }), "?region=x");
  assert.equal(buildQuery(new URLSearchParams("view=list"), { view: "cards" }), "");
  assert.equal(buildQuery(new URLSearchParams("q=a"), { sort: "name" }), "?q=a");
  assert.equal(buildQuery(new URLSearchParams("q=a&page=2"), { page: "3" }), "?q=a&page=3");
  assert.equal(buildQuery(new URLSearchParams("q=a&page=2"), { page: "1" }), "?q=a");
  const enc = buildQuery({}, { q: "o'rta & xor #1" });
  assert.match(enc, /%27/);
  assert.match(enc, /%26/);
  assert.match(enc, /%23/);
  assert.equal(new URLSearchParams(enc).get("q"), "o'rta & xor #1");
  assert.equal(buildQuery({ q: "x", page: "4" }, { view: "list" }), "?q=x&view=list");
});

test("buildPageList and totalPages", () => {
  assert.deepEqual(buildPageList(1, 1), [1]);
  assert.deepEqual(buildPageList(5, 20), [1, "gap", 4, 5, 6, "gap", 20]);
  assert.deepEqual(buildPageList(2, 3), [1, 2, 3]);
  assert.deepEqual(buildPageList(4, 10), [1, 2, 3, 4, 5, "gap", 10]);
  assert.equal(totalPages(0, 12), 1);
  assert.equal(totalPages(25, 12), 3);
  assert.equal(totalPages(24, 12), 2);
});
