import assert from "node:assert/strict";
import { test } from "node:test";
import { parseNote, rangeBar } from "./voice-range.ts";

test("parseNote returns MIDI numbers", () => {
  assert.equal(parseNote("C4"), 60);
  assert.equal(parseNote("A4"), 69);
  assert.equal(parseNote("F#3"), 54);
  assert.equal(parseNote("Bb2"), 46);
});

test("parseNote rejects malformed notes", () => {
  for (const bad of ["H9", "", "c4x", "C", "4C"]) assert.equal(parseNote(bad), null, bad);
});

test("rangeBar returns a positive bar inside 0-100 for a valid range", () => {
  const bar = rangeBar("C3", "C5");
  assert.ok(bar);
  assert.ok(bar.left >= 0 && bar.left + bar.width <= 100.0001);
  assert.ok(bar.width > 0);
});

test("rangeBar hides the indicator for invalid or inverted ranges (Review Focus 4)", () => {
  assert.equal(rangeBar("C5", "C3"), null);
  assert.equal(rangeBar("H9", "C4"), null);
  assert.equal(rangeBar("", ""), null);
  assert.equal(rangeBar("C8", "C9"), null);
});
