import type { Collective, Organization, OrganizationKind } from "../../types/collective.ts";
import type { TalentProfile } from "../../types/talent.ts";
import type { User, UserIdentity } from "../../types/user.ts";
import { DEMO_OTP, parseContact } from "../auth/contact.ts";
import { needsTwoFactor, REGISTERABLE_ROLES } from "../auth/flow.ts";
import type { Role } from "../demo/role.ts";
import { slugify } from "../mock/names.ts";
import { validateUpload } from "../upload.ts";
import { DataError } from "./errors.ts";
import { simulateLatency } from "./latency.ts";
import { store } from "./store.ts";
import { clone } from "./text.ts";

const MIN_PASSWORD = 8;
const digits = (s: string): string => s.replace(/\D/g, "");
const invalid = (message = "Maʼlumotlar notoʻgʻri") => new DataError("invalid", message);

const TALENT_ROLES = ["musician", "vocalist", "conductor", "composer"] as const;
type TalentRole = (typeof TALENT_ROLES)[number];
const isTalentRole = (r: Role): r is TalentRole => (TALENT_ROLES as readonly string[]).includes(r);
const ORG_KINDS: OrganizationKind[] = ["philharmonic", "theatre", "conservatory", "college", "school", "festival_org", "agency"];

function findUser(contact: { channel: "phone" | "email"; value: string }): User | undefined {
  return store.users.find((u) => (contact.channel === "email" ? u.email.toLowerCase() === contact.value : digits(u.phone) === digits(contact.value)));
}

function uniqueSlug(title: string, taken: Set<string>): string {
  const base = slugify(title) || "item";
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

/** Mock kirish: parol faqat uzunligi bo'yicha tekshiriladi (haqiqiy autentifikatsiya yo'q) */
export async function login(p: { identifier: string; password: string }): Promise<{ userId: string; role: Role; twoFactor: boolean }> {
  await simulateLatency();
  const contact = parseContact(p.identifier);
  if (!contact || p.password.length < MIN_PASSWORD) throw invalid();
  const user = findUser(contact);
  if (!user) throw new DataError("not_found", "Foydalanuvchi topilmadi");
  if (user.status === "blocked") throw new DataError("forbidden", "Hisob bloklangan");
  const role = user.roles[0] ?? "guest";
  return { userId: user.id, role, twoFactor: needsTwoFactor(role) };
}

type EntityInput = { entityName?: string; stir?: string; collectiveType?: "orchestra" | "choir"; orgKind?: OrganizationKind; documents?: { name: string; size: number }[] };

/** Rolga mos `pending` yozuv yaratadi: iqtidor profili, jamoa yoki tashkilot. Moderator tasdiqlamaguncha ommaga ko'rinmaydi. */
function createRecords(user: User, role: Role, e: EntityInput, contact: { phone?: string; email?: string }, requireDocuments: boolean): void {
  const now = new Date().toISOString();
  const regionId = store.references.regions[0]?.id ?? "tashkent-city";
  const documents = (e.documents ?? []).map((d) => d.name);

  if (isTalentRole(role)) {
    const n = store.talents.length + 1;
    const talent: TalentProfile = {
      id: `talent-new-${String(n).padStart(3, "0")}`,
      userId: user.id,
      slug: uniqueSlug(user.fullName, new Set(store.talents.map((t) => t.slug))),
      kind: role,
      fullName: user.fullName,
      photoUrl: `/placeholders/avatar-${(n % 8) + 1}.svg`,
      specialty: "",
      bio: "",
      regionId,
      city: "",
      instrumentIds: [],
      education: [],
      experience: [],
      experienceYears: 0,
      repertoire: [],
      availability: "open_to_offers",
      verified: false,
      featured: false,
      moderation: "pending",
      contacts: contact,
      createdAt: now,
    };
    store.talents.push(talent);
    return;
  }

  const entityName = (e.entityName ?? "").trim();
  if (entityName.length < 2 || entityName.length > 120) throw invalid("Nom kiritilmagan");
  if (requireDocuments && documents.length === 0) throw invalid("Hujjat kerak");

  if (role === "collective") {
    const n = store.collectives.length + 1;
    const collective: Collective = {
      id: `collective-new-${String(n).padStart(3, "0")}`,
      slug: uniqueSlug(entityName, new Set(store.collectives.map((c) => c.slug))),
      type: e.collectiveType === "choir" ? "choir" : "orchestra",
      name: entityName,
      logoUrl: `/placeholders/logo-${(n % 6) + 1}.svg`,
      regionId,
      city: "",
      foundedYear: new Date().getFullYear(),
      description: "",
      members: [],
      repertoire: [],
      events: [],
      verified: false,
      moderation: "pending",
      contacts: contact,
      ownerUserId: user.id,
      documents,
    };
    store.collectives.push(collective);
    return;
  }

  if (role === "organization") {
    const n = store.organizations.length + 1;
    const org: Organization = {
      id: `org-new-${String(n).padStart(3, "0")}`,
      slug: uniqueSlug(entityName, new Set(store.organizations.map((o) => o.slug))),
      name: entityName,
      kind: e.orgKind && ORG_KINDS.includes(e.orgKind) ? e.orgKind : "agency",
      logoUrl: `/placeholders/logo-${(n % 6) + 1}.svg`,
      regionId,
      city: "",
      description: "",
      verification: "pending",
      contacts: contact,
      createdAt: now,
      stir: e.stir,
      ownerUserId: user.id,
      documents,
    };
    store.organizations.push(org);
  }
}

function checkEntity(role: Role, e: EntityInput, requireDocuments: boolean): void {
  if (role !== "organization" && role !== "collective") return;
  if (!(e.entityName ?? "").trim()) throw invalid("Nom kiritilmagan");
  if (role === "organization") {
    if (!/^\d{9}$/.test(e.stir ?? "")) throw invalid("STIR 9 raqamdan iborat boʻlsin");
    if (store.organizations.some((o) => o.stir === e.stir)) throw new DataError("duplicate", "Bu STIR bilan tashkilot mavjud");
  }
  if (requireDocuments) {
    const docs = e.documents ?? [];
    if (docs.length === 0) throw invalid("Hujjat kerak");
    if (docs.some((d) => !validateUpload("document", d.name, d.size).ok)) throw invalid("Hujjat formati notoʻgʻri");
  }
}

export async function registerAccount(p: { role: Role; fullName: string; contact: string; password: string } & EntityInput): Promise<{ userId: string }> {
  await simulateLatency();
  const contact = parseContact(p.contact);
  const name = p.fullName.trim();
  const roleOk = (REGISTERABLE_ROLES as readonly string[]).includes(p.role);
  if (!contact || !roleOk || name.length < 2 || name.length > 80 || p.password.length < MIN_PASSWORD) throw invalid();
  checkEntity(p.role, p, true);
  if (findUser(contact)) throw new DataError("duplicate", "Bu kontakt bilan hisob mavjud");

  const identity: UserIdentity = { type: p.role === "organization" ? "legal" : "individual", ...(p.role === "organization" ? { stir: p.stir } : {}), source: "manual", verified: false };
  const user: User = {
    id: `user-new-${String(store.users.length + 1).padStart(3, "0")}`,
    fullName: name,
    phone: contact.channel === "phone" ? contact.value : "",
    email: contact.channel === "email" ? contact.value : "",
    roles: [p.role],
    status: "pending",
    createdAt: new Date().toISOString(),
    identity,
  };
  createRecords(user, p.role, p, contact.channel === "phone" ? { phone: contact.value } : { email: contact.value }, true);
  store.users.push(user);
  return { userId: user.id };
}

/** Mock OTP: faqat demo kod qabul qilinadi */
export async function verifyCode(code: string): Promise<void> {
  await simulateLatency();
  if (code !== DEMO_OTP) throw new DataError("invalid", "Kod notoʻgʻri");
}

/** Kodni tekshiradi va ro'yxatdan o'tgan foydalanuvchini faollashtiradi (kontakt tasdiqlandi) */
export async function verifyAndActivate(contactInput: string, code: string): Promise<{ userId: string; role: Role }> {
  await simulateLatency();
  if (code !== DEMO_OTP) throw new DataError("invalid", "Kod notoʻgʻri");
  const contact = parseContact(contactInput);
  const user = contact ? findUser(contact) : undefined;
  if (!user) throw new DataError("not_found", "Foydalanuvchi topilmadi");
  if (user.status === "pending") user.status = "active";
  return { userId: user.id, role: user.roles[0] ?? "guest" };
}

export type OneIdPayload =
  | { type: "individual"; pinfl: string; fullName: string; role: Role; entityName?: string; collectiveType?: "orchestra" | "choir" }
  | { type: "legal"; stir: string; entityName: string; representative: string; role: Role; collectiveType?: "orchestra" | "choir"; orgKind?: OrganizationKind };

const INDIVIDUAL_ROLES: Role[] = ["musician", "vocalist", "conductor", "composer", "collective"];
const LEGAL_ROLES: Role[] = ["organization", "collective"];

/**
 * OneID (mock): jismoniy shaxs PINFL (14 raqam), yuridik shaxs STIR (9 raqam) bilan aniqlanadi.
 * Mavjud identifikator — kirish; yangi — faol hisob (shaxs tasdiqlangan) va `pending` yozuv: uni moderator tasdiqlaydi.
 */
export async function oneIdSignIn(p: OneIdPayload): Promise<{ userId: string; role: Role; twoFactor: boolean; isNew: boolean }> {
  await simulateLatency();
  const key = p.type === "individual" ? p.pinfl : p.stir;
  if (p.type === "individual" ? !/^\d{14}$/.test(p.pinfl) : !/^\d{9}$/.test(p.stir)) throw invalid("PINFL/STIR formati notoʻgʻri");
  const name = (p.type === "individual" ? p.fullName : p.representative).trim();
  if (name.length < 2 || name.length > 80) throw invalid("Ism notoʻgʻri");

  const existing = store.users.find((u) => u.identity?.source === "oneid" && (p.type === "individual" ? u.identity.pinfl === key : u.identity.stir === key));
  if (existing) {
    if (existing.status === "blocked") throw new DataError("forbidden", "Hisob bloklangan");
    const role = existing.roles[0] ?? "guest";
    return { userId: existing.id, role, twoFactor: needsTwoFactor(role), isNew: false };
  }

  if (!(p.type === "individual" ? INDIVIDUAL_ROLES : LEGAL_ROLES).includes(p.role)) throw invalid("Rol bu shaxs turiga mos emas");
  const entity: EntityInput = p.type === "individual" ? { entityName: p.entityName, collectiveType: p.collectiveType } : { entityName: p.entityName, stir: p.stir, collectiveType: p.collectiveType, orgKind: p.orgKind };
  checkEntity(p.role, p.type === "legal" ? { ...entity, stir: p.role === "organization" ? p.stir : undefined } : entity, false);

  const user: User = {
    id: `user-new-${String(store.users.length + 1).padStart(3, "0")}`,
    fullName: name,
    phone: "",
    email: "",
    roles: [p.role],
    status: "active",
    createdAt: new Date().toISOString(),
    identity: p.type === "individual" ? { type: "individual", pinfl: p.pinfl, source: "oneid", verified: true } : { type: "legal", stir: p.stir, source: "oneid", verified: true },
  };
  createRecords(user, p.role, entity, {}, false);
  store.users.push(user);
  return { userId: user.id, role: p.role, twoFactor: needsTwoFactor(p.role), isNew: true };
}

/** Foydalanuvchining yozuvlari (iqtidor / jamoa / tashkilot) — tasdiqlanganidan qat'i nazar */
export async function getSubjectForUser(userId: string): Promise<{ user: User; talent?: TalentProfile; collective?: Collective; organization?: Organization } | null> {
  await simulateLatency();
  const user = store.users.find((u) => u.id === userId);
  if (!user) return null;
  const talent = store.talents.find((t) => t.userId === userId);
  const organization = store.organizations.find((o) => o.ownerUserId === userId || o.id.replace(/^org-/, "user-org-") === userId);
  const collective = store.collectives.find((c) => c.ownerUserId === userId);
  return clone({ user, ...(talent ? { talent } : {}), ...(collective ? { collective } : {}), ...(organization ? { organization } : {}) });
}
