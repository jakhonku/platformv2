import "server-only";
import { cookies } from "next/headers";
import { getMediaForOwner, getTalents } from "@/lib/data";
import { parseRole, ROLE_COOKIE, talentKindOfRole, type Role } from "./role";

export async function getDemoRole(): Promise<Role> {
  const store = await cookies();
  return parseRole(store.get(ROLE_COOKIE)?.value);
}

export type DemoApplicant = { talentId: string; name: string; media: { id: string; title: string }[] };

/** Demo rolga mos birinchi tasdiqlangan iqtidor (haqiqiy auth 7-bosqichda); iqtidor roli bo'lmasa null */
export async function getDemoApplicant(): Promise<DemoApplicant | null> {
  const kind = talentKindOfRole(await getDemoRole());
  if (!kind) return null;
  const { items } = await getTalents({ kind, verified: true }, 1, 1);
  const talent = items[0];
  if (!talent) return null;
  const media = await getMediaForOwner(talent.id);
  return { talentId: talent.id, name: talent.fullName, media: media.map((m) => ({ id: m.id, title: m.title })) };
}
