import assert from "node:assert/strict";
import { test } from "node:test";
import { isDemoEnabled, parseRole, ROLES, talentKindOfRole } from "./role.ts";

test("parseRole returns a valid role unchanged", () => {
  for (const r of ROLES) assert.equal(parseRole(r), r);
});

test("parseRole falls back to guest for unknown or missing values", () => {
  assert.equal(parseRole("hacker"), "guest");
  assert.equal(parseRole(""), "guest");
  assert.equal(parseRole(undefined), "guest");
});

test("isDemoEnabled is false in production without NEXT_PUBLIC_DEMO", () => {
  assert.equal(isDemoEnabled({ NODE_ENV: "production" }), false);
  assert.equal(isDemoEnabled({ NODE_ENV: "production", NEXT_PUBLIC_DEMO: "1" }), true);
  assert.equal(isDemoEnabled({ NODE_ENV: "development" }), true);
});

test("talentKindOfRole maps only talent roles", () => {
  assert.equal(talentKindOfRole("vocalist"), "vocalist");
  for (const r of ["organization", "guest", "admin", "moderator", "collective"] as const) assert.equal(talentKindOfRole(r), null);
});
