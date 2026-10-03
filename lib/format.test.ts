import assert from "node:assert/strict";
import { test } from "node:test";
import { daysLeft, formatCount, formatDate, formatDateRange, formatMoneyUzs } from "./format.ts";
import { localized } from "./localized.ts";

test("localized picks the requested language", () => {
  const text = { uz: "A", ru: "Б", en: "C" };
  assert.equal(localized(text, "uz"), "A");
  assert.equal(localized(text, "ru"), "Б");
  assert.equal(localized(text, "en"), "C");
});

test("formatDate formats per locale in Asia/Tashkent", () => {
  const iso = "2026-10-03T09:00:00.000Z";
  assert.match(formatDate(iso, "en"), /Oct/);
  assert.match(formatDate(iso, "ru"), /окт/i);
  assert.match(formatDate(iso, "uz"), /2026/);
  assert.match(formatDate(iso, "en", "long"), /October/);
});

test("formatDate uses Tashkent time near midnight UTC", () => {
  // 2026-12-31T20:00Z is already 2027-01-01 in Tashkent (UTC+5)
  assert.match(formatDate("2026-12-31T20:00:00.000Z", "en"), /2027/);
});

test("formatMoneyUzs groups digits and appends a unit", () => {
  for (const l of ["uz", "ru", "en"] as const) {
    const s = formatMoneyUzs(12_000_000, l);
    assert.match(s, /12\D?000\D?000/, s);
    assert.doesNotMatch(s, /NaN|undefined/);
  }
  assert.doesNotMatch(formatMoneyUzs(Number.NaN, "uz"), /NaN/);
});

test("daysLeft is positive for the future and 0 for the past", () => {
  const now = "2026-10-03T09:00:00.000Z";
  assert.equal(daysLeft("2026-10-10T09:00:00.000Z", now), 7);
  assert.equal(daysLeft("2026-10-03T10:00:00.000Z", now), 1);
  assert.equal(daysLeft("2026-09-01T09:00:00.000Z", now), 0);
});

test("formatDateRange collapses a single-day range", () => {
  const a = "2026-10-03T10:00:00.000Z";
  assert.equal(formatDateRange(a, "2026-10-03T12:00:00.000Z", "en"), formatDate(a, "en"));
  assert.match(formatDateRange(a, "2026-10-07T10:00:00.000Z", "en"), /–/);
});

test("formatCount groups thousands with a no-break space regardless of runtime ICU (hydration-safe)", () => {
  assert.equal(formatCount(0), "0");
  assert.equal(formatCount(999), "999");
  assert.equal(formatCount(2767), "2 767");
  assert.equal(formatCount(1234567), "1 234 567");
  assert.equal(formatCount(-4500), "-4 500");
  assert.equal(formatCount(Number.NaN), "0");
});
