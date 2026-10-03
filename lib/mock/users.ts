import type { User } from "../../types/user.ts";
import { ORGANIZATIONS } from "./organizations.ts";
import { phone } from "./names.ts";
import { createRng, randomDate } from "./random.ts";
import { TALENTS } from "./talents.ts";

const rng = createRng(99);

const staff: User[] = [
  {
    id: "user-admin",
    fullName: "Sardor Rahimov",
    phone: "+998 90 000 00 01",
    email: "admin@example.uz",
    roles: ["admin"],
    status: "active",
    createdAt: "2024-01-01T09:00:00.000Z",
  },
  {
    id: "user-moderator",
    fullName: "Nilufar Karimova",
    phone: "+998 90 000 00 02",
    email: "moderator@example.uz",
    roles: ["moderator"],
    status: "active",
    createdAt: "2024-01-02T09:00:00.000Z",
  },
];

const talentUsers: User[] = TALENTS.map((t, i) => ({
  id: t.userId,
  fullName: t.fullName,
  phone: t.contacts.phone ?? phone(0, 100, 10, 10),
  email: t.contacts.email ?? `${t.slug}@example.uz`,
  roles: [t.kind],
  status: t.moderation === "pending" ? "pending" : i === 11 ? "blocked" : "active",
  createdAt: t.createdAt,
}));

const orgUsers: User[] = ORGANIZATIONS.map((o, i) => ({
  id: `user-org-${String(i + 1).padStart(2, "0")}`,
  fullName: `${o.name} (vakil)`,
  phone: o.contacts.phone ?? phone(0, 100, 10, 10),
  email: o.contacts.email ?? `org${i + 1}@example.uz`,
  roles: ["organization"],
  status: o.verification === "pending" ? "pending" : "active",
  createdAt: randomDate(rng, "2024-01-01", "2026-06-01"),
}));

export const USERS: User[] = [...staff, ...talentUsers, ...orgUsers];
