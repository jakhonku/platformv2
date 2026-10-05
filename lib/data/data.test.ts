import assert from "node:assert/strict";
import { test } from "node:test";
import { store } from "./store.ts";
import { parseContact } from "../auth/contact.ts";
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
  getModerationList,
  importCollectiveMembers,
  importOrganizationStaff,
  logReviewCall,
  setReviewChecklist,
  startReview,
  updateOrganization,
  getCollectiveDetailById,
  getCollectiveInvitesFor,
  getCollectiveInvitesOf,
  getSubjectForUser,
  inviteCollectiveMember,
  oneIdSignIn,
  respondToCollectiveInvite,
  verifyAndActivate,
  createBackup,
  deleteEvent,
  deleteNews,
  deleteOpening,
  deleteReference,
  getAdminStatistics,
  getBanners,
  getCompetitionBySlug,
  getNewsBySlug,
  getSystemInfo,
  getSystemSettings,
  saveBanner,
  saveCompetition,
  saveFestival,
  saveNews,
  saveReference,
  saveSystemSettings,
  setUserRoles,
  setUserStatus,
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

/** Testlar uchun: yozuvni to'liqlantirib, tekshiruv shartlarini bajaradi (tasdiqlash mumkin bo'lishi uchun) */
function approvable(kind: "profile" | "organization" | "collective", id: string) {
  if (kind === "profile") {
    const t = store.talents.find((x) => x.id === id)!;
    Object.assign(t, {
      specialty: t.specialty || "Mutaxassis",
      bio: t.bio.length >= 10 ? t.bio : "Qisqa tavsif matni.",
      city: t.city || "Toshkent",
      instrumentIds: t.instrumentIds.length ? t.instrumentIds : ["violin"],
      voiceTypeId: t.voiceTypeId ?? "tenor",
      contacts: { ...t.contacts, phone: t.contacts.phone ?? "+998 90 000 00 00" },
    });
  } else if (kind === "organization") {
    const o = store.organizations.find((x) => x.id === id)!;
    Object.assign(o, { description: o.description.length >= 10 ? o.description : "Tashkilot haqida tavsif.", city: o.city || "Toshkent", stir: o.stir ?? "123456789", documents: o.documents?.length ? o.documents : ["guvohnoma.pdf"], contacts: { ...o.contacts, phone: o.contacts.phone ?? "+998 90 000 00 00" } });
  } else {
    const c = store.collectives.find((x) => x.id === id)!;
    Object.assign(c, { description: c.description.length >= 10 ? c.description : "Jamoa haqida tavsif.", city: c.city || "Toshkent", documents: c.documents?.length ? c.documents : ["nizom.pdf"], contacts: { ...c.contacts, phone: c.contacts.phone ?? "+998 90 000 00 00" } });
  }
  store.reviews[kind + ":" + id] = { assigneeId: "user-moderator", checklist: { documents: true, phone: true }, calls: [] };
}

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
  approvable("profile", item.id);
  const done = await moderate("profile", item.id, "approved");
  assert.equal(done.id, item.id);
  assert.ok(!(await getModerationQueue("profile")).some((q) => q.id === item.id));
  assert.equal((await getAuditLog(1, 1)).items[0].entityId, item.id);
  await assert.rejects(() => moderate("media", "media-yoq", "rejected", "Sifat yetarli emas"), (e: unknown) => e instanceof DataError && e.code === "not_found");
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

test("setUserStatus blocks users, writes audit and protects the last admin (Review Focus 2, 3)", async () => {
  const victim = USERS.find((u) => u.roles[0] === "musician" && u.status === "active" && u.id !== "user-admin")!;
  const before = (await getAuditLog(1, 100)).total;
  const blocked = await setUserStatus(victim.id, "blocked", "user-admin");
  assert.equal(blocked.status, "blocked");
  assert.equal((await getAuditLog(1, 100)).total, before + 1);
  await assert.rejects(() => setUserStatus("user-admin", "blocked"), { code: "forbidden" });
  await assert.rejects(() => setUserRoles("user-admin", ["musician"]), { code: "forbidden" });
  await assert.rejects(() => setUserRoles(victim.id, []), { code: "invalid" });
  await assert.rejects(() => setUserRoles(victim.id, ["guest"]), { code: "invalid" });
  await assert.rejects(() => setUserStatus("yoq", "active"), { code: "not_found" });
  const roles = await setUserRoles(victim.id, ["musician", "composer"]);
  assert.deepEqual(roles.roles, ["musician", "composer"]);
});

test("competition and festival CRUD (Review Focus 5)", async () => {
  const base = { title: "Yangi tanlov nomi", description: "Tanlov haqida batafsil tavsif.", regionId: "bukhara", city: "Buxoro", startDate: "2027-05-01T10:00:00.000Z", endDate: "2027-05-03T10:00:00.000Z", imageUrl: "/placeholders/event.jpg" };
  const a = await saveCompetition({ ...base, deadline: "2027-04-01T10:00:00.000Z", categoryId: "competition", prizeFundUzs: 1000000 });
  const b = await saveCompetition({ ...base, deadline: "2027-04-01T10:00:00.000Z", categoryId: "competition" });
  assert.notEqual(a.slug, b.slug);
  assert.equal((await getCompetitionBySlug(a.slug))?.id, a.id);
  const edited = await saveCompetition({ ...base, id: a.id, title: "Yangilangan nom", deadline: "2027-04-01T10:00:00.000Z", categoryId: "competition" });
  assert.equal(edited.id, a.id);
  assert.equal(edited.title, "Yangilangan nom");
  await assert.rejects(() => saveCompetition({ ...base, startDate: "2027-06-01T10:00:00.000Z", deadline: "2027-04-01T10:00:00.000Z", categoryId: "competition" }), { code: "invalid" });
  await assert.rejects(() => saveCompetition({ ...base, title: "", deadline: "2027-04-01T10:00:00.000Z", categoryId: "competition" }), { code: "invalid" });
  await assert.rejects(() => saveFestival({ ...base, regionId: "yoq", lineup: [] }), { code: "invalid" });
  const fest = await saveFestival({ ...base, lineup: ["Orkestr"] });
  assert.deepEqual(fest.lineup, ["Orkestr"]);
  await deleteEvent("competition", a.id);
  assert.equal(await getCompetitionBySlug(a.slug), null);
  await assert.rejects(() => deleteEvent("festival", "yoq"), { code: "not_found" });
});

test("news, banners and openings admin", async () => {
  const n = await saveNews({ title: "Yangi yangilik sarlavhasi", excerpt: "Qisqa mazmun matni.", body: "Yangilikning toʻliq matni kamida yigirma belgi.", categoryId: "concerts", imageUrl: "/placeholders/news.jpg" });
  assert.equal((await getNewsBySlug(n.slug))?.id, n.id);
  await deleteNews(n.id);
  assert.equal(await getNewsBySlug(n.slug), null);
  const banner = await saveBanner({ title: "Aksiya", link: "/castings", imageUrl: "", active: true });
  assert.ok((await getBanners()).some((b) => b.id === banner.id));
  await assert.rejects(() => saveBanner({ title: "Bad", link: "javascript:x", imageUrl: "", active: true }), { code: "invalid" });
  const c = await createCasting("org-01", { title: "Vaqtinchalik kasting", description: "Kamida yigirma belgidan iborat tavsif.", location: "Toshkent", eventDate: "2027-03-01T18:00:00.000Z", deadline: "2026-12-30T18:00:00.000Z" });
  await deleteOpening("casting", c.id);
  await assert.rejects(() => deleteOpening("casting", c.id), { code: "not_found" });
});

test("reference CRUD (Review Focus 4)", async () => {
  const item = { name: { uz: "Yangi cholgʻu", ru: "Новый инструмент", en: "New instrument" }, family: "folk" as const };
  const saved = await saveReference("instrument", item);
  assert.ok(saved.id);
  assert.ok((await getReferences()).instruments.some((i) => i.id === saved.id));
  await assert.rejects(() => saveReference("instrument", { ...item, name: { ...item.name, ru: "" } }), { code: "invalid" });
  await deleteReference("instrument", saved.id);
  assert.ok(!(await getReferences()).instruments.some((i) => i.id === saved.id));
  await assert.rejects(() => deleteReference("instrument", saved.id), { code: "not_found" });
});

test("system settings, backup and statistics (Review Focus 6, 7)", async () => {
  const s = await getSystemSettings();
  await saveSystemSettings({ ...s, maintenanceMode: true, supportEmail: "help@example.uz" });
  assert.equal((await getSystemSettings()).maintenanceMode, true);
  await assert.rejects(() => saveSystemSettings({ ...s, supportEmail: "bad" }), { code: "invalid" });
  const backup = await createBackup();
  const data = JSON.parse(backup.json);
  for (const k of ["users", "talents", "collectives", "organizations", "media", "castings", "vacancies", "applications"]) assert.ok(Array.isArray(data[k]), k);
  assert.ok((await getSystemInfo()).lastBackupAt);
  const stats = await getAdminStatistics();
  assert.equal(stats.monthlyViews.length, 12);
  assert.ok(stats.talentsByKind.length > 0);
});

test("rejecting requires a reason of at least 5 characters (Review Focus 2)", async () => {
  const [item] = await getModerationQueue("media");
  await assert.rejects(() => moderate("media", item.id, "rejected"), { code: "invalid" });
  await assert.rejects(() => moderate("media", item.id, "rejected", "yo"), { code: "invalid" });
  const done = await moderate("media", item.id, "rejected", "Sifat talabiga mos emas");
  assert.equal(done.status, "rejected");
});

const doc = [{ name: "nizom.pdf", size: 1000 }];

test("registerAccount creates real pending records per role (Review Focus 1)", async () => {
  const t = await registerAccount({ role: "composer", fullName: "Yangi Kompozitor", contact: "+998 93 111 22 33", password: "password123" });
  const subj = await getSubjectForUser(t.userId);
  assert.equal(subj?.talent?.moderation, "pending");
  assert.equal(subj?.talent?.kind, "composer");
  assert.equal(subj?.user.status, "pending");
  assert.equal(subj?.user.identity?.source, "manual");

  const org = await registerAccount({ role: "organization", fullName: "Vakil Shaxs", contact: "org-new@example.uz", password: "password123", entityName: "Yangi Teatr", stir: "123456789", orgKind: "theatre", documents: doc });
  const orgSubj = await getSubjectForUser(org.userId);
  assert.equal(orgSubj?.organization?.verification, "pending");
  assert.equal(orgSubj?.organization?.stir, "123456789");
  assert.equal(orgSubj?.user.identity?.type, "legal");

  const col = await registerAccount({ role: "collective", fullName: "Rahbar Shaxs", contact: "col-new@example.uz", password: "password123", entityName: "Yangi Xor", collectiveType: "choir", documents: doc });
  const colSubj = await getSubjectForUser(col.userId);
  assert.equal(colSubj?.collective?.moderation, "pending");
  assert.equal(colSubj?.collective?.type, "choir");
  assert.equal(await getSubjectForUser("yoq"), null);
});

test("entity registration validates name, STIR, documents and duplicates (Review Focus 1)", async () => {
  const base = { role: "organization" as const, fullName: "Vakil Shaxs", contact: "org-bad@example.uz", password: "password123", entityName: "Teatr Bad", stir: "987654321", documents: doc };
  await assert.rejects(() => registerAccount({ ...base, entityName: "" }), { code: "invalid" });
  await assert.rejects(() => registerAccount({ ...base, stir: "123" }), { code: "invalid" });
  await assert.rejects(() => registerAccount({ ...base, documents: [] }), { code: "invalid" });
  await assert.rejects(() => registerAccount({ ...base, documents: [{ name: "x.exe", size: 5 }] }), { code: "invalid" });
  await registerAccount(base);
  await assert.rejects(() => registerAccount({ ...base, contact: "org-bad2@example.uz" }), { code: "duplicate" });
  await assert.rejects(() => registerAccount({ role: "collective", fullName: "Rahbar", contact: "col-bad@example.uz", password: "password123", entityName: "Xor", documents: [] }), { code: "invalid" });
});

test("verifyAndActivate activates a pending user", async () => {
  await registerAccount({ role: "musician", fullName: "Faollashuvchi", contact: "+998 94 555 66 77", password: "password123" });
  await assert.rejects(() => verifyAndActivate("+998 94 555 66 77", "000000"), { code: "invalid" });
  await assert.rejects(() => verifyAndActivate("+998 90 999 99 99", "123456"), { code: "not_found" });
  const res = await verifyAndActivate("+998 94 555 66 77", "123456");
  assert.equal(res.role, "musician");
  assert.equal((await getSubjectForUser(res.userId))?.user.status, "active");
});

test("oneIdSignIn distinguishes individuals and legal entities (Review Focus 1, 4)", async () => {
  const a = await oneIdSignIn({ type: "individual", pinfl: "12345678901234", fullName: "Oneid Musiqachi", role: "musician" });
  assert.equal(a.isNew, true);
  const subj = await getSubjectForUser(a.userId);
  assert.equal(subj?.user.status, "active");
  assert.equal(subj?.user.identity?.verified, true);
  assert.equal(subj?.user.identity?.source, "oneid");
  assert.equal(subj?.talent?.moderation, "pending");
  const again = await oneIdSignIn({ type: "individual", pinfl: "12345678901234", fullName: "Oneid Musiqachi", role: "musician" });
  assert.equal(again.isNew, false);
  assert.equal(again.userId, a.userId);
  const queue = await getModerationQueue("profile");
  assert.ok(queue.some((q) => q.id === subj!.talent!.id && q.meta?.identity === "oneid"));
  approvable("profile", subj!.talent!.id);
  await moderate("profile", subj!.talent!.id, "approved");
  assert.equal((await getSubjectForUser(a.userId))?.talent?.verified, true);

  const legal = await oneIdSignIn({ type: "legal", stir: "555666777", entityName: "Oneid Filarmoniya", representative: "Vakil", role: "organization" });
  assert.equal(legal.twoFactor, true);
  const org = (await getSubjectForUser(legal.userId))?.organization;
  assert.equal(org?.verification, "pending");
  assert.equal(org?.stir, "555666777");
  await assert.rejects(() => oneIdSignIn({ type: "individual", pinfl: "123", fullName: "X Y", role: "musician" }), { code: "invalid" });
  await assert.rejects(() => oneIdSignIn({ type: "legal", stir: "12", entityName: "Teatr", representative: "Vakil", role: "organization" }), { code: "invalid" });
  await assert.rejects(() => oneIdSignIn({ type: "legal", stir: "111222333", entityName: "Teatr", representative: "Vakil", role: "musician" as never }), { code: "invalid" });
});

test("moderation covers collectives and keeps the rejection note (Review Focus 3)", async () => {
  const res = await registerAccount({ role: "collective", fullName: "Rahbar Ikki", contact: "col-mod@example.uz", password: "password123", entityName: "Moderatsiya Orkestri", documents: doc });
  const collective = (await getSubjectForUser(res.userId))!.collective!;
  const queue = await getModerationQueue("collective");
  assert.ok(queue.some((q) => q.id === collective.id));
  await assert.rejects(() => moderate("collective", collective.id, "rejected"), { code: "invalid" });
  await moderate("collective", collective.id, "rejected", "Hujjat yetarli emas");
  assert.equal((await getCollectiveDetailById(collective.id))?.moderationNote, "Hujjat yetarli emas");
  approvable("collective", collective.id);
  await moderate("collective", collective.id, "approved");
  const approvedCollective = await getCollectiveDetailById(collective.id);
  assert.equal(approvedCollective?.moderation, "approved");
  assert.equal(approvedCollective?.moderationNote, undefined);
});

test("unverified organizations cannot create openings (Review Focus 2)", async () => {
  const res = await registerAccount({ role: "organization", fullName: "Vakil Uch", contact: "org-open@example.uz", password: "password123", entityName: "Ochiq Teatr", stir: "246813579", documents: doc });
  const org = (await getSubjectForUser(res.userId))!.organization!;
  const payload = { title: "Yangi kasting nomi", description: "Kamida yigirma belgidan iborat tavsif matni.", location: "Toshkent", eventDate: "2027-03-01T18:00:00.000Z", deadline: "2026-12-30T18:00:00.000Z" };
  await assert.rejects(() => createCasting(org.id, payload), { code: "forbidden" });
  approvable("organization", org.id);
  await moderate("organization", org.id, "approved");
  const c = await createCasting(org.id, payload);
  assert.equal(c.organizationId, org.id);
});

test("collective membership is two-sided (Review Focus 5)", async () => {
  const col = ORCHESTRAS[1];
  const fresh = approved.find((t) => !col.members.some((m) => m.talentId === t.id))!;
  const invite = await inviteCollectiveMember(col.id, { talentId: fresh.id, section: "Skripka" });
  assert.equal(invite.status, "pending");
  assert.ok((await getCollectiveInvitesOf(col.id)).some((i) => i.id === invite.id));
  assert.ok((await getCollectiveInvitesFor(fresh.id)).some((i) => i.id === invite.id));
  await assert.rejects(() => inviteCollectiveMember(col.id, { talentId: fresh.id, section: "Skripka" }), { code: "duplicate" });
  await assert.rejects(() => inviteCollectiveMember(col.id, { talentId: col.members[0].talentId, section: "X" }), { code: "duplicate" });
  assert.ok(!(await getCollectiveDetailById(col.id))!.members.some((m) => m.talentId === fresh.id));
  await respondToCollectiveInvite(invite.id, "accepted");
  assert.ok((await getCollectiveDetailById(col.id))!.members.some((m) => m.talentId === fresh.id));
  await assert.rejects(() => respondToCollectiveInvite(invite.id, "accepted"), { code: "invalid" });

  const other = approved.find((t) => t.id !== fresh.id && !col.members.some((m) => m.talentId === t.id))!;
  const declined = await inviteCollectiveMember(col.id, { talentId: other.id, section: "Alt" });
  await respondToCollectiveInvite(declined.id, "declined");
  assert.ok(!(await getCollectiveDetailById(col.id))!.members.some((m) => m.talentId === other.id));
  await assert.rejects(() => respondToCollectiveInvite("yoq", "accepted"), { code: "not_found" });
  await assert.rejects(() => inviteCollectiveMember(col.id, { talentId: "yoq", section: "X" }), { code: "not_found" });
});

test("approval needs data, an assignee, a call and checked documents (Review Focus 1, 2, 3)", async () => {
  const res = await registerAccount({ role: "organization", fullName: "Vakil Tort", contact: "org-review@example.uz", password: "password123", entityName: "Tekshiruv Teatri", stir: "135792468", documents: doc });
  const org = (await getSubjectForUser(res.userId))!.organization!;
  await assert.rejects(() => moderate("organization", org.id, "approved"), { code: "forbidden" });
  await assert.rejects(() => setReviewChecklist("organization", org.id, { phone: true }), { code: "forbidden" });
  await assert.rejects(() => logReviewCall("organization", org.id, { outcome: "reached", note: "ok" }), { code: "invalid" });
  await assert.rejects(() => startReview("organization", "yoq"), { code: "not_found" });

  const started = await startReview("organization", org.id, "user-moderator");
  assert.equal(started.assigneeId, "user-moderator");
  const noAnswer = await logReviewCall("organization", org.id, { outcome: "no_answer", note: "Javob bermadi" }, "user-moderator");
  assert.equal(noAnswer.checklist.phone, false);
  const reached = await logReviewCall("organization", org.id, { outcome: "reached", note: "Direktor bilan gaplashildi, maʼlumotlar tasdiqlandi" }, "user-moderator");
  assert.equal(reached.checklist.phone, true);
  assert.equal(reached.calls.length, 2);
  await setReviewChecklist("organization", org.id, { documents: true });
  await assert.rejects(() => moderate("organization", org.id, "approved"), { code: "forbidden" }); // description/city/phone yetishmaydi

  await updateOrganization(org.id, { description: "Teatr haqida toʻliq tavsif.", city: "Buxoro", regionId: "bukhara", contacts: { phone: "+998 90 111 22 33" } });
  const item = (await getModerationList("organization")).find((i) => i.id === org.id)!;
  assert.equal(item.completeness?.percent, 100);
  assert.equal(item.review?.calls.length, 2);
  const done = await moderate("organization", org.id, "approved");
  assert.equal(done.status, "approved");

  const taken = await startReview("organization", org.id, "user-admin");
  assert.equal(taken.assigneeId, "user-admin");
});

test("moderation list returns every status with review info", async () => {
  const list = await getModerationList("collective");
  assert.ok(list.some((i) => i.status === "approved"));
  assert.ok(list.some((i) => i.status === "pending" && i.completeness && i.completeness.percent < 100));
  assert.ok(list.every((i) => i.review && i.completeness));
  const media = await getModerationList("media");
  assert.ok(media.length > 0 && media.every((i) => !i.review));
});

test("Excel import creates invitations for known talents and keeps the rest as unregistered (Review Focus 5)", async () => {
  const col = ORCHESTRAS[3];
  const known = approved.find((t) => {
    const phone = store.users.find((u) => u.id === t.userId)?.phone;
    return phone && parseContact(phone)?.channel === "phone" && !col.members.some((m) => m.talentId === t.id);
  })!;
  const knownPhone = parseContact(store.users.find((u) => u.id === known.userId)!.phone)!.value;
  const rows = [
    { name: known.fullName, phone: knownPhone, section: "Skripka" },
    { name: "Yangi A'zo Birinchi", phone: "+998 97 111 22 33", section: "Alt" },
  ];
  const first = await importCollectiveMembers(col.id, rows);
  assert.deepEqual(first, { matched: 1, unmatched: 1, duplicates: 0 });
  assert.ok((await getCollectiveInvitesFor(known.id)).some((i) => i.collectiveId === col.id && i.status === "pending"));
  const detail = await getCollectiveDetailById(col.id);
  assert.equal(detail?.unregisteredMembers?.length, 1);
  assert.ok(!detail!.members.some((m) => m.talentId === known.id));
  const second = await importCollectiveMembers(col.id, rows);
  assert.deepEqual(second, { matched: 0, unmatched: 0, duplicates: 2 });
  await assert.rejects(() => importCollectiveMembers(col.id, [{ name: "X", phone: "123", section: "" }]), { code: "invalid" });
  await assert.rejects(() => importCollectiveMembers("yoq", rows), { code: "not_found" });

  const staff = await importOrganizationStaff("org-01", [...rows, { name: "Xodim Uchinchi", phone: "+998 98 777 66 55", section: "Administrator" }]);
  assert.deepEqual(staff, { matched: 1, unmatched: 2, duplicates: 0 });
  assert.deepEqual(await importOrganizationStaff("org-01", rows), { matched: 0, unmatched: 0, duplicates: 2 });
});
