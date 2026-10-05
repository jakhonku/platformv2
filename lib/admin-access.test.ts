import assert from "node:assert/strict";
import { test } from "node:test";
import { ROLES } from "./demo/role.ts";
import { ADMIN_SECTIONS, canAccess } from "./admin-access.ts";

test("admin sees every section", () => {
  assert.equal(ADMIN_SECTIONS.length, 14);
  for (const s of ADMIN_SECTIONS) assert.equal(canAccess("admin", s), true);
});

test("moderator sees only moderation sections (Review Focus 1)", () => {
  const allowed = ADMIN_SECTIONS.filter((s) => canAccess("moderator", s));
  assert.deepEqual([...allowed].sort(), ["castings", "collectives", "dashboard", "media", "organizations", "profiles"]);
});

test("other roles see nothing", () => {
  for (const r of ROLES.filter((x) => x !== "admin" && x !== "moderator")) for (const s of ADMIN_SECTIONS) assert.equal(canAccess(r, s), false);
});
