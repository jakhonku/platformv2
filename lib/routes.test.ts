import assert from "node:assert/strict";
import { test } from "node:test";
import { casting, collective, news, talent } from "./routes.ts";

test("talent routes map kinds to catalog sections", () => {
  assert.equal(talent("musician", "jasur-karimov"), "/musicians/jasur-karimov");
  assert.equal(talent("vocalist", "x"), "/vocalists/x");
  assert.equal(talent("conductor", "x"), "/conductors/x");
  assert.equal(talent("composer", "x"), "/composers/x");
});

test("collective, casting and news routes", () => {
  assert.equal(collective("orchestra", "toshkent"), "/orchestras/toshkent");
  assert.equal(collective("choir", "yoshlar"), "/choirs/yoshlar");
  assert.equal(casting("casting-01"), "/castings/casting-01");
  assert.equal(news("yangilik"), "/news/yangilik");
});
