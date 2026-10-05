import assert from "node:assert/strict";
import { test } from "node:test";
import { APPLICATIONS, CASTINGS, MOCK_NOW, NOTIFICATIONS, ORCHESTRAS, TALENTS, USERS, VACANCIES } from "../mock/index.ts";
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
  addCollectiveEvent,
  addCollectiveMember,
  addMedia,
  createCasting,
  createCollection,
  createVacancy,
  deleteMedia,
  getCollectionsForOwner,
  getInvitationsFor,
  getNotificationSettings,
  getPortfolioStats,
  markAllNotificationsRead,
  respondToInvitation,
  saveNotificationSettings,
  updateMedia,
  updateTalentProfile,
  login,
  registerAccount,
  verifyCode,
  markNotificationRead,
  moderate,
  paginate,
  sendInvitation,
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


test("sendInvitation stores a valid invitation and validates input (Review Focus 6)", async () => {
  const talent = TALENTS.find((t) => t.moderation === "approved")!;
  const ok = { senderName: "  Filarmoniya  ", contact: "+998 90 123 45 67", message: "Konsertda ishtirok etishingizni taklif qilamiz." };
  const inv = await sendInvitation(talent.id, ok);
  assert.equal(inv.talentId, talent.id);
  assert.equal(inv.senderName, "Filarmoniya");

  await assert.rejects(sendInvitation(talent.id, { ...ok, message: "qisqa" }), (e) => e instanceof DataError && e.code === "invalid");
  await assert.rejects(sendInvitation(talent.id, { ...ok, message: "x".repeat(1001) }), (e) => e instanceof DataError && e.code === "invalid");

  const pending = TALENTS.find((t) => t.moderation === "rejected")!;
  await assert.rejects(sendInvitation(pending.id, ok), (e) => e instanceof DataError && e.code === "not_found");
  await assert.rejects(sendInvitation("yoq", ok), (e) => e instanceof DataError && e.code === "not_found");
});

test("login: staff needs two-factor, talents do not", async () => {
  const admin = await login({ identifier: "admin@example.uz", password: "password123" });
  assert.equal(admin.role, "admin");
  assert.equal(admin.twoFactor, true);
  const talentUser = USERS.find((u) => u.roles[0] === "musician" && u.status === "active")!;
  const res = await login({ identifier: talentUser.email, password: "password123" });
  assert.equal(res.role, "musician");
  assert.equal(res.twoFactor, false);
});

test("login errors (Review Focus 3)", async () => {
  await assert.rejects(() => login({ identifier: "nobody@example.uz", password: "password123" }), { code: "not_found" });
  await assert.rejects(() => login({ identifier: "admin@example.uz", password: "short" }), { code: "invalid" });
  await assert.rejects(() => login({ identifier: "<script>", password: "password123" }), { code: "invalid" });
  const blocked = USERS.find((u) => u.status === "blocked")!;
  await assert.rejects(() => login({ identifier: blocked.email, password: "password123" }), { code: "forbidden" });
});

test("registerAccount creates a pending user and rejects duplicates (Review Focus 4)", async () => {
  const payload = { role: "vocalist" as const, fullName: "Test Foydalanuvchi", contact: "+998 91 000 11 22", password: "password123" };
  const { userId } = await registerAccount(payload);
  assert.ok(userId);
  await assert.rejects(() => registerAccount(payload), { code: "duplicate" });
  await assert.rejects(() => registerAccount({ ...payload, contact: "x" }), { code: "invalid" });
  await assert.rejects(() => registerAccount({ ...payload, contact: "new@example.uz", fullName: "A" }), { code: "invalid" });
  await assert.rejects(() => registerAccount({ ...payload, contact: "new@example.uz", role: "admin" }), { code: "invalid" });
});

test("verifyCode accepts only the demo code", async () => {
  await verifyCode("123456");
  await assert.rejects(() => verifyCode("000000"), { code: "invalid" });
});

const me = approved.find((t) => t.verified)!;
const YT = "https://youtu.be/dQw4w9WgXcQ";

test("updateTalentProfile updates valid fields and rejects invalid ones (Review Focus 3)", async () => {
  const updated = await updateTalentProfile(me.id, { specialty: "Yangi mutaxassislik", bio: "Qisqa bio", experienceYears: 12 });
  assert.equal(updated.specialty, "Yangi mutaxassislik");
  assert.equal(updated.experienceYears, 12);
  await assert.rejects(() => updateTalentProfile(me.id, { bio: "x".repeat(2001) }), { code: "invalid" });
  await assert.rejects(() => updateTalentProfile(me.id, { experienceYears: -1 }), { code: "invalid" });
  await assert.rejects(() => updateTalentProfile(me.id, { regionId: "yoq" }), { code: "invalid" });
  await assert.rejects(() => updateTalentProfile("yoq", { bio: "salom" }), { code: "not_found" });
});

test("addMedia creates pending items and validates uploads (Review Focus 2, 4)", async () => {
  const yt = await addMedia(me.id, "talent", { kind: "video", title: "Konsert", description: "", youtube: YT });
  assert.equal(yt.moderation, "pending");
  assert.equal(yt.youtubeId, "dQw4w9WgXcQ");
  const file = await addMedia(me.id, "talent", { kind: "audio", title: "Yozuv", description: "tavsif", fileName: "a.mp3", sizeBytes: 1000 });
  assert.equal(file.type, "audio");
  await assert.rejects(() => addMedia(me.id, "talent", { kind: "video", title: "Bad", description: "", fileName: "a.exe", sizeBytes: 5 }), { code: "invalid" });
  await assert.rejects(() => addMedia(me.id, "talent", { kind: "video", title: "Bad", description: "", youtube: "javascript:alert(1)" }), { code: "invalid" });
  await assert.rejects(() => addMedia(me.id, "talent", { kind: "video", title: "x", description: "", youtube: YT }), { code: "invalid" });

  const col = await createCollection(me.id, { title: "Tanlangan", description: "", itemIds: [yt.id, file.id] });
  assert.deepEqual(col.itemIds, [yt.id, file.id]);
  const renamed = await updateMedia(yt.id, { title: "Yangi nom", description: "yangi" });
  assert.equal(renamed.title, "Yangi nom");
  await deleteMedia(yt.id);
  const cols = await getCollectionsForOwner(me.id);
  assert.deepEqual(cols.find((c) => c.id === col.id)!.itemIds, [file.id]);
  await assert.rejects(() => deleteMedia(yt.id), { code: "not_found" });
});

test("getPortfolioStats is consistent (Review Focus 4)", async () => {
  const stats = await getPortfolioStats(me.id);
  assert.equal(stats.monthly.length, 12);
  assert.equal(stats.totalViews, stats.items.reduce((n, i) => n + i.views, 0));
  assert.equal(stats.monthly.reduce((n, m) => n + m.views, 0), stats.totalViews);
  const empty = await getPortfolioStats("yoq");
  assert.equal(empty.totalViews, 0);
  assert.deepEqual(empty.items, []);
});

test("invitations, notification settings and mark-all-read", async () => {
  const withOffer = approved.find((t) => t.verified && t.id !== me.id)!;
  const seeded = (await Promise.all(approved.map((t) => getInvitationsFor(t.id)))).flat();
  assert.ok(seeded.length >= 3, "mock has seeded invitations");
  const first = seeded[0];
  const done = await respondToInvitation(first.id, "accepted");
  assert.equal(done.status, "accepted");
  await assert.rejects(() => respondToInvitation("yoq", "declined"), { code: "not_found" });
  void withOffer;

  const defaults = await getNotificationSettings("user-x");
  assert.deepEqual(defaults, { internal: true, email: true, sms: true, telegram: true });
  await saveNotificationSettings("user-x", { ...defaults, sms: false });
  assert.equal((await getNotificationSettings("user-x")).sms, false);

  const userId = NOTIFICATIONS.find((n) => !n.read)!.userId;
  const count = await markAllNotificationsRead(userId);
  assert.ok(count >= 1);
  assert.equal(await markAllNotificationsRead(userId), 0);
});

test("createCasting / createVacancy validate input (Review Focus 6)", async () => {
  const base = { title: "Yangi kasting nomi", description: "Kamida yigirma belgidan iborat tavsif matni.", deadline: "2026-12-30T18:00:00.000Z" };
  const c = await createCasting("org-01", { ...base, location: "Toshkent", eventDate: "2027-02-01T18:00:00.000Z", requirements: {} });
  assert.equal(c.status, "open");
  assert.equal(c.organizationId, "org-01");
  await assert.rejects(() => createCasting("org-01", { ...base, deadline: "2020-01-01T00:00:00.000Z", location: "T", eventDate: "2027-02-01T18:00:00.000Z" }), { code: "invalid" });
  await assert.rejects(() => createCasting("org-01", { ...base, title: "", location: "T", eventDate: "2027-02-01T18:00:00.000Z" }), { code: "invalid" });
  const v = await createVacancy("org-01", { ...base, employment: "full_time", regionId: "tashkent-city", city: "Toshkent", salaryFromUzs: 3000000, salaryToUzs: 5000000 });
  assert.equal(v.status, "open");
  await assert.rejects(() => createVacancy("org-01", { ...base, employment: "full_time", regionId: "tashkent-city", city: "Toshkent", salaryFromUzs: 5000000, salaryToUzs: 3000000 }), { code: "invalid" });
  await assert.rejects(() => createCasting("yoq", { ...base, location: "T", eventDate: "2027-02-01T18:00:00.000Z" }), { code: "not_found" });
});

test("collective members and events (Review Focus 7)", async () => {
  const col = ORCHESTRAS[0];
  const existing = col.members[0].talentId;
  await assert.rejects(() => addCollectiveMember(col.id, { talentId: existing, section: "Skripka" }), { code: "duplicate" });
  await assert.rejects(() => addCollectiveMember(col.id, { talentId: "yoq", section: "Skripka" }), { code: "not_found" });
  const fresh = approved.find((t) => !col.members.some((m) => m.talentId === t.id))!;
  const withNew = await addCollectiveMember(col.id, { talentId: fresh.id, section: "Skripka" });
  assert.ok(withNew.members.some((m) => m.talentId === fresh.id));
  const ev = await addCollectiveEvent(col.id, { title: "Konsert", date: "2026-12-01T18:00:00.000Z", venue: "Zal" });
  assert.ok(ev.events.some((e) => e.title === "Konsert"));
  await assert.rejects(() => addCollectiveEvent(col.id, { title: "Konsert", date: "notadate", venue: "Zal" }), { code: "invalid" });
});
