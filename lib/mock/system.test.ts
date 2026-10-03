import assert from "node:assert/strict";
import { test } from "node:test";
import { AUDIT_LOG, COLLECTIONS, MEDIA, NOTIFICATIONS, ORGANIZATIONS, TALENTS, USERS } from "./index.ts";

const talentIds = new Set(TALENTS.map((t) => t.id));
const userIds = new Set(USERS.map((u) => u.id));

test("every talent has 1-4 media items and all media types appear", () => {
  for (const t of TALENTS) {
    const n = MEDIA.filter((m) => m.ownerId === t.id).length;
    assert.ok(n >= 1 && n <= 4, `${t.slug}: ${n}`);
  }
  const types = new Set(MEDIA.map((m) => m.type));
  for (const type of ["video", "audio", "document", "score", "midi"]) assert.ok(types.has(type as never), type);
  assert.equal(new Set(MEDIA.map((m) => m.id)).size, MEDIA.length);
});

test("media references and URLs are valid", () => {
  for (const m of MEDIA) {
    assert.ok(talentIds.has(m.ownerId), m.id);
    assert.ok(m.views >= 0);
    if (m.type === "video") {
      assert.match(m.url, /^https:\/\/(www\.youtube\.com\/|youtu\.be\/)/, m.id);
      assert.ok(m.youtubeId && m.youtubeId.length === 11, m.id);
    } else {
      assert.match(m.url, /^\/samples\//, m.id);
    }
  }
});

test("moderation states all occur", () => {
  const states = new Set(MEDIA.map((m) => m.moderation));
  for (const s of ["pending", "approved", "rejected"]) assert.ok(states.has(s as never), s);
});

test("collections only contain media of the same owner", () => {
  assert.ok(COLLECTIONS.length >= 3);
  const byId = new Map(MEDIA.map((m) => [m.id, m]));
  for (const c of COLLECTIONS) {
    assert.ok(c.itemIds.length >= 1);
    for (const id of c.itemIds) assert.equal(byId.get(id)?.ownerId, c.ownerId, `${c.id} ${id}`);
  }
});

test("notifications cover every channel, read and unread, and valid users", () => {
  assert.ok(NOTIFICATIONS.length >= 15);
  const channels = new Set(NOTIFICATIONS.map((n) => n.channel));
  for (const c of ["internal", "email", "sms", "telegram"]) assert.ok(channels.has(c as never), c);
  assert.ok(NOTIFICATIONS.some((n) => n.read) && NOTIFICATIONS.some((n) => !n.read));
  for (const n of NOTIFICATIONS) assert.ok(userIds.has(n.userId), n.id);
  assert.equal(new Set(NOTIFICATIONS.map((n) => n.id)).size, NOTIFICATIONS.length);
});

test("audit log has at least 30 entries, valid actors, newest first", () => {
  assert.ok(AUDIT_LOG.length >= 30);
  for (const e of AUDIT_LOG) assert.ok(userIds.has(e.actorId), e.id);
  for (let i = 1; i < AUDIT_LOG.length; i++) assert.ok(AUDIT_LOG[i - 1].at >= AUDIT_LOG[i].at);
  const entityIds = new Set([...TALENTS.map((t) => t.id), ...ORGANIZATIONS.map((o) => o.id), ...MEDIA.map((m) => m.id)]);
  for (const e of AUDIT_LOG.filter((x) => ["talent", "organization", "media"].includes(x.entityType))) {
    assert.ok(entityIds.has(e.entityId), `${e.id} -> ${e.entityId}`);
  }
});

test("Uzbek system texts use no ASCII apostrophes", () => {
  const texts = [
    ...MEDIA.flatMap((m) => [m.title, m.description]),
    ...COLLECTIONS.flatMap((c) => [c.title, c.description]),
    ...NOTIFICATIONS.flatMap((n) => [n.title, n.body]),
    ...AUDIT_LOG.map((e) => `${e.action} ${e.details ?? ""}`),
  ];
  for (const s of texts) assert.doesNotMatch(s, /[OoGg]'/, s);
});
