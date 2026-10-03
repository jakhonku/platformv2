import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSearchHref } from "./search-href.ts";

test("empty or whitespace-only query goes to the bare catalog (Review Focus 1)", () => {
  assert.equal(buildSearchHref("talents", ""), "/musicians");
  assert.equal(buildSearchHref("talents", "   "), "/musicians");
});

test("each search type maps to its catalog", () => {
  assert.equal(buildSearchHref("collectives", ""), "/orchestras");
  assert.equal(buildSearchHref("castings", ""), "/castings");
  assert.equal(buildSearchHref("vacancies", ""), "/vacancies");
});

test("query is trimmed and URL-encoded (&, #, spaces, Uzbek apostrophes)", () => {
  assert.equal(buildSearchHref("castings", " orkestr & xor "), "/castings?q=orkestr%20%26%20xor");
  assert.equal(buildSearchHref("talents", "a#b"), "/musicians?q=a%23b");
  assert.equal(buildSearchHref("talents", "Oʻtkir"), `/musicians?q=${encodeURIComponent("Oʻtkir")}`);
  assert.ok(!buildSearchHref("talents", "x&y=1").includes("&y="));
});
