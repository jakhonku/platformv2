import assert from "node:assert/strict";
import { test } from "node:test";
import { ROLES } from "../demo/role.ts";
import { homeFor, needsTwoFactor, parseRegisterRole, REGISTERABLE_ROLES } from "./flow.ts";

test("two-factor is required for organization, moderator and admin only", () => {
  const required = ROLES.filter(needsTwoFactor);
  assert.deepEqual([...required].sort(), ["admin", "moderator", "organization"]);
});

test("homeFor", () => {
  assert.equal(homeFor("admin"), "/admin");
  assert.equal(homeFor("moderator"), "/admin");
  assert.equal(homeFor("musician"), "/cabinet");
  assert.equal(homeFor("organization"), "/cabinet");
});

test("parseRegisterRole accepts only registerable roles", () => {
  assert.equal(parseRegisterRole("admin"), null);
  assert.equal(parseRegisterRole("guest"), null);
  assert.equal(parseRegisterRole("hacker"), null);
  assert.equal(parseRegisterRole(undefined), null);
  assert.equal(parseRegisterRole("organization"), "organization");
  assert.equal(REGISTERABLE_ROLES.length, 6);
});
