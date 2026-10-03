import assert from "node:assert/strict";
import { test } from "node:test";
import { INSTRUMENTS, REGIONS, VOICE_TYPES } from "../constants/index.ts";
import { CHOIRS, ORCHESTRAS, ORGANIZATIONS, TALENTS, USERS } from "./index.ts";
import { createRng } from "./random.ts";

const COLLECTIVES = [...ORCHESTRAS, ...CHOIRS];
const regionIds = new Set(REGIONS.map((r) => r.id));
const instrumentIds = new Set(INSTRUMENTS.map((i) => i.id));
const voiceIds = new Set<string>(VOICE_TYPES.map((v) => v.id));

test("minimum counts", () => {
  assert.ok(TALENTS.length >= 40);
  assert.ok(TALENTS.filter((t) => t.moderation === "approved").length >= 40);
  assert.ok(TALENTS.filter((t) => t.kind === "vocalist").length >= 8);
  assert.ok(TALENTS.filter((t) => t.kind === "conductor").length >= 5);
  assert.ok(TALENTS.filter((t) => t.kind === "composer").length >= 5);
  assert.equal(ORCHESTRAS.length, 8);
  assert.equal(CHOIRS.length, 6);
  assert.equal(ORGANIZATIONS.length, 10);
});

test("slugs and ids are unique", () => {
  for (const list of [TALENTS, COLLECTIVES, ORGANIZATIONS]) {
    assert.equal(new Set(list.map((x) => x.slug)).size, list.length);
    assert.equal(new Set(list.map((x) => x.id)).size, list.length);
  }
  assert.equal(new Set(USERS.map((u) => u.id)).size, USERS.length);
});

test("talent references resolve", () => {
  const collectiveIds = new Set(COLLECTIVES.map((c) => c.id));
  const userIds = new Set(USERS.map((u) => u.id));
  for (const t of TALENTS) {
    assert.ok(regionIds.has(t.regionId), `${t.slug} region`);
    assert.ok(REGIONS.find((r) => r.id === t.regionId)!.cities.includes(t.city), `${t.slug} city`);
    assert.ok(userIds.has(t.userId), `${t.slug} user`);
    for (const id of t.instrumentIds) assert.ok(instrumentIds.has(id), `${t.slug} instrument ${id}`);
    if (t.currentCollectiveId) assert.ok(collectiveIds.has(t.currentCollectiveId), `${t.slug} collective`);
    if (t.kind === "vocalist") {
      assert.ok(t.voiceTypeId && voiceIds.has(t.voiceTypeId), `${t.slug} voice`);
      const vt = VOICE_TYPES.find((v) => v.id === t.voiceTypeId)!;
      assert.deepEqual(t.voiceRange, vt.range);
    } else {
      assert.equal(t.voiceTypeId, undefined);
    }
  }
});

test("collective references resolve and every collective has members", () => {
  const talentById = new Map(TALENTS.map((t) => [t.id, t]));
  for (const c of COLLECTIVES) {
    assert.ok(regionIds.has(c.regionId));
    assert.ok(c.members.length >= 1, `${c.slug} members`);
    for (const m of c.members) assert.ok(talentById.has(m.talentId), `${c.slug} member ${m.talentId}`);
    if (c.conductorId) assert.equal(talentById.get(c.conductorId)?.kind, "conductor");
  }
});

test("organizations and users reference valid data", () => {
  for (const o of ORGANIZATIONS) assert.ok(regionIds.has(o.regionId));
  assert.ok(USERS.some((u) => u.roles.includes("admin")));
  assert.ok(USERS.some((u) => u.roles.includes("moderator")));
  assert.ok(USERS.filter((u) => u.roles.includes("organization")).length >= ORGANIZATIONS.length);
});

test("Uzbek names use no ASCII apostrophes", () => {
  const texts = [
    ...TALENTS.flatMap((t) => [t.fullName, t.specialty, t.bio, ...t.repertoire]),
    ...COLLECTIVES.flatMap((c) => [c.name, c.description, ...c.repertoire]),
    ...ORGANIZATIONS.flatMap((o) => [o.name, o.description]),
  ];
  for (const s of texts) assert.doesNotMatch(s, /[OoGg]'/, s);
});

test("rng is deterministic and availability is a valid value", () => {
  const a = createRng(1);
  const b = createRng(1);
  for (let i = 0; i < 20; i++) assert.equal(a.next(), b.next());
  assert.ok(["available", "busy", "open_to_offers"].includes(TALENTS[0].availability));
});
