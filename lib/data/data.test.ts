import assert from "node:assert/strict";
import { test } from "node:test";
import { APPLICATIONS, CASTINGS, MOCK_NOW, NOTIFICATIONS, TALENTS, VACANCIES } from "../mock/index.ts";
import {
  DataError,
  applyToCasting,
  applyToVacancy,
  getAdminStats,
  getApplicantsFor,
  getAuditLog,
  getCastingById,
  getCastings,
  getCollectiveBySlug,
  getCollectives,
  getFeaturedTalents,
  getMediaForOwner,
  getModerationQueue,
  getMyApplications,
  getNews,
  getNotifications,
  getOrganizations,
  getReferences,
  getTalentBySlug,
  getTalents,
  getUsers,
  getVacancies,
  markNotificationRead,
  moderate,
  paginate,
  simulateLatency,
  updateApplicationStatus,
} from "./index.ts";

process.env.DATA_LATENCY_MS = "0";

const approved = TALENTS.filter((t) => t.moderation === "approved");

test("paginate clamps page and pageSize (Review Focus 3)", () => {
  assert.equal(paginate([1, 2, 3], 0, 2).page, 1);
  assert.equal(paginate([1, 2, 3], -5, 2).page, 1);
  const far = paginate([1, 2, 3], 999, 2);
  assert.deepEqual(far.items, []);
  assert.equal(far.total, 3);
  assert.equal(paginate([1, 2, 3], 1, 1000).pageSize, 100);
  assert.equal(paginate([1, 2, 3], 1, 0).pageSize, 12);
  assert.equal(paginate([1, 2, 3], 1, -3).pageSize, 12);
  assert.equal(paginate([1, 2, 3], 1, 1).pageSize, 1);
  assert.equal(paginate([1, 2, 3], Number.NaN, Number.NaN).page, 1);
  assert.deepEqual(paginate([1, 2, 3], 2, 2).items, [3]);
});

test("simulateLatency waits 300-600 ms when DATA_LATENCY_MS is not set", async () => {
  delete process.env.DATA_LATENCY_MS;
  const t0 = Date.now();
  await simulateLatency();
  const dt = Date.now() - t0;
  process.env.DATA_LATENCY_MS = "0";
  assert.ok(dt >= 290 && dt <= 800, `latency ${dt}ms`);
});

test("getTalents returns the REST-shaped page of approved profiles", async () => {
  const res = await getTalents({});
  assert.equal(res.items.length, 12);
  assert.equal(res.page, 1);
  assert.equal(res.pageSize, 12);
  assert.ok(res.total >= 40);
  assert.ok(res.items.every((t) => t.moderation === "approved"));
});

test("getTalents filters: empty result, kind+voice, verified, search ignores apostrophe variants", async () => {
  const none = await getTalents({ q: "zzzzzz" });
  assert.deepEqual([none.items.length, none.total], [0, 0]);

  const tenors = await getTalents({ kind: "vocalist", voiceTypeId: "tenor" });
  assert.ok(tenors.total >= 1);
  assert.ok(tenors.items.every((t) => t.kind === "vocalist" && t.voiceTypeId === "tenor"));

  const verified = await getTalents({ verified: true }, 1, 100);
  assert.ok(verified.items.length >= 1 && verified.items.every((t) => t.verified));

  const withApostrophe = approved.find((t) => t.fullName.includes("ʻ"));
  if (withApostrophe) {
    const key = withApostrophe.fullName.split(" ")[0].replace(/ʻ/g, "'").toLowerCase();
    const found = await getTalents({ q: key }, 1, 100);
    assert.ok(found.items.some((t) => t.id === withApostrophe.id));
  }
  await assert.rejects(() => getTalents({ kind: "wizard" as never }), (e: unknown) => e instanceof DataError && e.code === "invalid");
});

test("getTalents sorting and availability filters", async () => {
  const byExp = await getTalents({ sort: "experience" }, 1, 100);
  for (let i = 1; i < byExp.items.length; i++) assert.ok(byExp.items[i - 1].experienceYears >= byExp.items[i].experienceYears);
  const free = await getTalents({ availability: "available" }, 1, 100);
  assert.ok(free.items.every((t) => t.availability === "available"));
});

test("getTalentBySlug: unknown slug is null, known slug matches (Review Focus 2)", async () => {
  assert.equal(await getTalentBySlug("yoq-slug"), null);
  const t = approved[0];
  assert.equal((await getTalentBySlug(t.slug))?.id, t.id);
});

test("returned objects are copies (Review Focus 6)", async () => {
  const slug = approved[0].slug;
  const a = await getTalentBySlug(slug);
  a!.fullName = "O'zgargan";
  a!.instrumentIds.push("hack");
  const b = await getTalentBySlug(slug);
  assert.equal(b!.fullName, approved[0].fullName);
  assert.ok(!b!.instrumentIds.includes("hack"));
});

test("featured talents are verified, approved and limited", async () => {
  const list = await getFeaturedTalents(5);
  assert.ok(list.length > 0 && list.length <= 5);
  assert.ok(list.every((t) => t.featured && t.verified));
});

test("collectives and organizations: lists and details", async () => {
  const orchestras = await getCollectives({ type: "orchestra" });
  assert.equal(orchestras.total, 8);
  const choirs = await getCollectives({ type: "choir" });
  assert.equal(choirs.total, 6);
  const detail = await getCollectiveBySlug(orchestras.items[0].slug);
  assert.ok(detail && detail.memberProfiles.length === detail.members.length);
  assert.equal(await getCollectiveBySlug("yoq"), null);
  const orgs = await getOrganizations({});
  assert.ok(orgs.items.every((o) => o.verification === "approved"));
});

test("castings and vacancies: lists, filters and details", async () => {
  const open = await getCastings({ status: "open" }, 1, 100);
  assert.ok(open.items.length >= 6 && open.items.every((c) => c.status === "open"));
  const closed = await getCastings({ status: "closed" }, 1, 100);
  assert.ok(closed.items.length >= 2);
  const violin = await getCastings({ instrumentId: "violin" }, 1, 100);
  assert.ok(violin.items.every((c) => c.requirements.instrumentIds?.includes("violin")));
  const detail = await getCastingById(CASTINGS[0].id);
  assert.equal(detail?.organization?.id, CASTINGS[0].organizationId);
  assert.equal(await getCastingById("casting-yoq"), null);
  const vacancies = await getVacancies({ employment: "full_time" }, 1, 100);
  assert.ok(vacancies.items.every((v) => v.employment === "full_time"));
});

test("applyToCasting: success, duplicate, closed, not_found (Review Focus 5)", async () => {
  const openCasting = CASTINGS.find((c) => c.status === "open")!;
  const closedCasting = CASTINGS.find((c) => c.status === "closed")!;
  const taken = new Set(APPLICATIONS.filter((a) => a.castingId === openCasting.id).map((a) => a.talentId));
  const talent = approved.find((t) => !taken.has(t.id))!;

  const before = (await getApplicantsFor(openCasting.id)).length;
  const app = await applyToCasting(openCasting.id, { talentId: talent.id, message: "Salom" });
  assert.equal(app.status, "submitted");
  assert.equal(app.castingId, openCasting.id);
  assert.equal((await getApplicantsFor(openCasting.id)).length, before + 1);

  await assert.rejects(() => applyToCasting(openCasting.id, { talentId: talent.id }), (e: unknown) => e instanceof DataError && e.code === "duplicate");
  await assert.rejects(() => applyToCasting(closedCasting.id, { talentId: talent.id }), (e: unknown) => e instanceof DataError && e.code === "closed");
  await assert.rejects(() => applyToCasting("casting-yoq", { talentId: talent.id }), (e: unknown) => e instanceof DataError && e.code === "not_found");
  await assert.rejects(() => applyToCasting(openCasting.id, { talentId: "talent-yoq" }), (e: unknown) => e instanceof DataError && e.code === "not_found");
  assert.equal((await getApplicantsFor(openCasting.id)).length, before + 1, "state must not change after failed calls");
  assert.ok((await getMyApplications(talent.id)).some((a) => a.id === app.id));
});

test("applyToVacancy works for open vacancies and rejects closed ones", async () => {
  const open = VACANCIES.find((v) => v.status === "open")!;
  const closed = VACANCIES.find((v) => v.status === "closed")!;
  const taken = new Set(APPLICATIONS.filter((a) => a.vacancyId === open.id).map((a) => a.talentId));
  const talent = approved.find((t) => !taken.has(t.id))!;
  const app = await applyToVacancy(open.id, { talentId: talent.id });
  assert.equal(app.vacancyId, open.id);
  await assert.rejects(() => applyToVacancy(closed.id, { talentId: talent.id }), (e: unknown) => e instanceof DataError && e.code === "closed");
});

test("updateApplicationStatus appends history and validates input", async () => {
  const target = APPLICATIONS.find((a) => a.status === "submitted")!;
  const updated = await updateApplicationStatus(target.id, "shortlisted");
  assert.equal(updated.status, "shortlisted");
  assert.equal(updated.history.at(-1)?.status, "shortlisted");
  await assert.rejects(() => updateApplicationStatus("application-yoq", "viewed"), (e: unknown) => e instanceof DataError && e.code === "not_found");
  await assert.rejects(() => updateApplicationStatus(target.id, "bogus" as never), (e: unknown) => e instanceof DataError && e.code === "invalid");
});

test("news is newest first and paginated", async () => {
  const page = await getNews({}, 1, 5);
  assert.equal(page.items.length, 5);
  assert.equal(page.total, 12);
  for (let i = 1; i < page.items.length; i++) assert.ok(page.items[i - 1].publishedAt > page.items[i].publishedAt);
});

test("media for owner hides unapproved by default", async () => {
  const owner = approved[1].id;
  const visible = await getMediaForOwner(owner);
  assert.ok(visible.every((m) => m.moderation === "approved"));
  const all = await getMediaForOwner(owner, { includeAll: true });
  assert.ok(all.length >= visible.length);
});

test("moderation queue and decisions", async () => {
  const queue = await getModerationQueue("profile");
  assert.ok(queue.length >= 1);
  const item = queue[0];
  const done = await moderate("profile", item.id, "approved");
  assert.equal(done.id, item.id);
  assert.ok(!(await getModerationQueue("profile")).some((q) => q.id === item.id));
  assert.equal((await getAuditLog(1, 1)).items[0].entityId, item.id);
  await assert.rejects(() => moderate("media", "media-yoq", "rejected"), (e: unknown) => e instanceof DataError && e.code === "not_found");
});

test("notifications, stats, users, audit log, references", async () => {
  const n = NOTIFICATIONS.find((x) => !x.read)!;
  const list = await getNotifications(n.userId);
  assert.ok(list.length >= 1);
  const marked = await markNotificationRead(n.id);
  assert.equal(marked.read, true);

  const stats = await getAdminStats();
  assert.equal(stats.monthlyViews.length, 12);
  assert.ok(stats.users > 40 && stats.castingsOpen >= 6);

  const admins = await getUsers({ role: "admin" });
  assert.equal(admins.total, 1);
  assert.equal((await getUsers({ q: "zzzzzz" })).total, 0);

  assert.ok((await getAuditLog()).total >= 30);

  const refs = await getReferences();
  assert.equal(refs.regions.length, 14);
  assert.equal(refs.voiceTypes.length, 6);
  assert.ok(MOCK_NOW);
});

