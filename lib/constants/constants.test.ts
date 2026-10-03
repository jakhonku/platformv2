import assert from "node:assert/strict";
import { test } from "node:test";
import { CATEGORIES, INSTRUMENTS, REGIONS, VOICE_TYPES, regionById } from "./index.ts";

const LOCALES = ["uz", "ru", "en"] as const;

test("14 regions including Karakalpakstan and Tashkent city", () => {
  assert.equal(REGIONS.length, 14);
  assert.ok(regionById("karakalpakstan"));
  assert.ok(regionById("tashkent-city"));
  assert.equal(new Set(REGIONS.map((r) => r.id)).size, 14);
  for (const r of REGIONS) assert.ok(r.cities.length >= 1, r.id);
});

test("six voice types in the canonical order", () => {
  assert.deepEqual(
    VOICE_TYPES.map((v) => v.id),
    ["soprano", "mezzo-soprano", "alto", "tenor", "baritone", "bass"],
  );
  for (const v of VOICE_TYPES) assert.ok(v.range.low && v.range.high);
});

test("instruments: unique ids and at least 4 per family", () => {
  assert.equal(new Set(INSTRUMENTS.map((i) => i.id)).size, INSTRUMENTS.length);
  for (const family of ["symphonic", "folk", "jazz", "keyboard", "percussion"] as const) {
    assert.ok(INSTRUMENTS.filter((i) => i.family === family).length >= 4, family);
  }
});

test("every localized name is filled in all three languages and uses no ASCII apostrophe in Uzbek", () => {
  const all = [
    ...REGIONS.map((r) => r.name),
    ...INSTRUMENTS.map((i) => i.name),
    ...VOICE_TYPES.map((v) => v.name),
    ...CATEGORIES.map((c) => c.name),
  ];
  for (const name of all) {
    for (const l of LOCALES) assert.ok(name[l].trim().length > 0, JSON.stringify(name));
    assert.doesNotMatch(name.uz, /[og]'/i, name.uz);
  }
});
