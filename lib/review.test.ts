import assert from "node:assert/strict";
import { test } from "node:test";
import type { Collective, Organization } from "../types/collective.ts";
import type { ReviewState } from "../types/review.ts";
import type { TalentProfile } from "../types/talent.ts";
import { approvalBlockers, completeness, missingFields } from "./review.ts";

const talent = (patch: Partial<TalentProfile> = {}): TalentProfile => ({
  id: "t1", userId: "u1", slug: "t1", kind: "musician", fullName: "Vali Aliyev", photoUrl: "/p.svg", specialty: "Skripkachi", bio: "Tajribali skripkachi, solist.", regionId: "bukhara", city: "Buxoro",
  instrumentIds: ["violin"], education: [], experience: [], experienceYears: 3, repertoire: [], availability: "available", verified: false, featured: false, moderation: "pending",
  contacts: { phone: "+998 90 123 45 67" }, createdAt: "2026-10-01T00:00:00.000Z", ...patch,
});
const org = (patch: Partial<Organization> = {}): Organization => ({
  id: "o1", slug: "o1", name: "Teatr", kind: "theatre", logoUrl: "/l.svg", regionId: "bukhara", city: "Buxoro", description: "Opera va balet teatri.", verification: "pending",
  contacts: { phone: "+998 90 123 45 67" }, createdAt: "2026-10-01T00:00:00.000Z", stir: "123456789", documents: ["guvohnoma.pdf"], ...patch,
});
const collective = (patch: Partial<Collective> = {}): Collective => ({
  id: "c1", slug: "c1", type: "choir", name: "Xor", logoUrl: "/l.svg", regionId: "bukhara", city: "Buxoro", foundedYear: 2020, description: "Yoshlar xori jamoasi.", members: [], repertoire: [], events: [],
  verified: false, moderation: "pending", contacts: { phone: "+998 90 123 45 67" }, documents: ["nizom.pdf"], ...patch,
});
const review = (patch: Partial<ReviewState> = {}): ReviewState => ({ checklist: { documents: false, phone: false }, calls: [], ...patch });

test("complete records have nothing missing (Review Focus 1)", () => {
  assert.deepEqual(missingFields("profile", talent()), []);
  assert.deepEqual(missingFields("organization", org()), []);
  assert.deepEqual(missingFields("collective", collective()), []);
  assert.equal(completeness("profile", talent()).percent, 100);
});

test("missing profile fields are listed", () => {
  const m = missingFields("profile", talent({ specialty: "", bio: "qisqa", city: "", instrumentIds: [], contacts: {} }));
  assert.deepEqual([...m].sort(), ["bio", "city", "contact", "skills", "specialty"]);
  assert.ok(completeness("profile", talent({ specialty: "", bio: "" })).percent < 100);
  assert.deepEqual(missingFields("profile", talent({ kind: "vocalist", instrumentIds: [], voiceTypeId: "tenor" })), []);
  assert.deepEqual(missingFields("profile", talent({ kind: "vocalist", instrumentIds: [] })), ["skills"]);
  assert.deepEqual(missingFields("profile", talent({ kind: "conductor", instrumentIds: [] })), []);
});

test("organization and collective requirements", () => {
  assert.deepEqual([...missingFields("organization", org({ stir: "12", documents: [], description: "", city: "", contacts: {} }))].sort(), ["city", "description", "documents", "phone", "stir"]);
  assert.deepEqual([...missingFields("collective", collective({ documents: [], description: "x", city: "", contacts: {} }))].sort(), ["city", "description", "documents", "phone"]);
});

test("approvalBlockers list what stops an approval", () => {
  assert.deepEqual(approvalBlockers("organization", org(), review()), ["not_started", "documents", "phone"]);
  assert.deepEqual(approvalBlockers("organization", org({ stir: "" }), review({ assigneeId: "user-admin", checklist: { documents: true, phone: true } })), ["data"]);
  assert.deepEqual(approvalBlockers("profile", talent(), review({ assigneeId: "user-admin" })), ["phone"]);
  assert.deepEqual(approvalBlockers("collective", collective(), review({ assigneeId: "user-admin", checklist: { documents: true, phone: true } })), []);
});

test("reviewTab separates new, in-review, approved and rejected applications", async () => {
  const { reviewTab } = await import("./review.ts");
  assert.equal(reviewTab("pending"), "new");
  assert.equal(reviewTab("pending", review()), "new");
  assert.equal(reviewTab("pending", review({ assigneeId: "user-admin" })), "in_review");
  assert.equal(reviewTab("approved", review({ assigneeId: "user-admin" })), "approved");
  assert.equal(reviewTab("rejected"), "rejected");
});
