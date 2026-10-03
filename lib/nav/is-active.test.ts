import assert from "node:assert/strict";
import { test } from "node:test";
import { isActive } from "./is-active.ts";

test("isActive matches regardless of locale prefix", () => {
  assert.equal(isActive("/ru/cabinet/profile", "/cabinet/profile"), true);
  assert.equal(isActive("/cabinet/profile", "/cabinet/profile"), true);
});

test("isActive does not match a different page", () => {
  assert.equal(isActive("/uz/cabinet", "/cabinet/profile"), false);
});

test("isActive matches nested pages; root hrefs match exactly", () => {
  assert.equal(isActive("/en/cabinet/applications/42", "/cabinet/applications"), true);
  assert.equal(isActive("/uz/cabinet/profile", "/cabinet", true), false);
  assert.equal(isActive("/uz/cabinet/profile", "/cabinet"), true);
  assert.equal(isActive("/uz/cabinet", "/cabinet"), true);
  assert.equal(isActive("/uz/cabinetry", "/cabinet/x"), false);
});
