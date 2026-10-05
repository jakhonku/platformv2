"use client";

import { useRouter } from "@/i18n/navigation";
import { homeFor, needsTwoFactor } from "@/lib/auth/flow";
import { signInAs } from "@/lib/demo/actions";
import type { Role } from "@/lib/demo/role";

/**
 * Mock kirishni yakunlaydi: ikki bosqichli rol uchun avval 2FA ekraniga (sessiya hali o`rnatilmaydi),
 * aks holda rol va foydalanuvchi cookie`sini o`rnatib kabinetga yo`naltiradi.
 */
export function useSignIn() {
  const router = useRouter();
  const finish = async (role: Role, userId?: string) => {
    await signInAs(role, userId);
    router.push(homeFor(role));
    router.refresh();
  };
  return {
    /** Parol/OTP/OneID muvaffaqiyatli bo`lgandan keyin */
    async afterCredentials(role: Role, userId?: string) {
      if (needsTwoFactor(role)) {
        router.push(`/two-factor?role=${role}${userId ? `&user=${encodeURIComponent(userId)}` : ""}`);
        return;
      }
      await finish(role, userId);
    },
    /** 2FA tasdiqlangandan keyin */
    complete: finish,
  };
}
