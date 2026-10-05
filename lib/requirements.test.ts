import assert from "node:assert/strict";
import { test } from "node:test";
import { instrumentById } from "./constants/index.ts";
import { localized } from "./localized.ts";
import { requirementRows } from "./requirements.ts";

test("empty requirements produce no rows (Review Focus 6)", () => {
  assert.deepEqual(requirementRows({}, "uz"), []);
});

test("rows keep a fixed order and localize names", () => {
  const rows = requirementRows(
    { kinds: ["musician"], instrumentIds: ["violin"], voiceTypeIds: ["tenor"], regionIds: ["bukhara"], minExperience: 3 },
    "ru",
  );
  assert.deepEqual(
    rows.map((r) => r.key),
    ["kinds", "instruments", "voices", "regions", "experience"],
  );
  assert.deepEqual(rows[0].values, ["musician"]);
  assert.equal(rows[1].values[0], localized(instrumentById("violin")!.name, "ru"));
  assert.deepEqual(rows[4].values, ["3"]);
});

test("unknown ids and zero experience are dropped", () => {
  assert.deepEqual(requirementRows({ instrumentIds: ["yoq"] }, "uz"), []);
  assert.deepEqual(requirementRows({ minExperience: 0 }, "uz"), []);
});
