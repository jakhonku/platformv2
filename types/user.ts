import type { IsoDate } from "./common.ts";

// Rollar ro'yxati lib/demo/role.ts da yagona manba sifatida saqlanadi (takrorlanmaydi)
export type { Role } from "../lib/demo/role.ts";
export { ROLES as ROLE_LIST } from "../lib/demo/role.ts";

import type { Role } from "../lib/demo/role.ts";

export type UserStatus = "active" | "pending" | "blocked";

export type User = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  roles: Role[];
  status: UserStatus;
  createdAt: IsoDate;
};
