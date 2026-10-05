"use client";

import { useRouter } from "@/i18n/navigation";
import { homeFor, needsTwoFactor } from "@/lib/auth/flow";
import { setDemoRole } from "@/lib/demo/actions";
import type { Role } from "@/lib/demo/role";

/**
 * Mock kirishni yakunlaydi: ikki bosqichli rol uchun avval 2FA ekraniga (rol hali o'rnatilmaydi),
 * aks holda demo rolni o'rnatib kabinetga yo'naltiradi.
 */
export function useSignIn() {
  const router = useRouter();
  return {
    /** Parol/OTP muvaffaqiyatli bo'lgandan keyin */
    async afterCredentials(role: Role) {
      if (needsTwoFactor(role)) {
        router.push(`/two-factor?role=${role}`);
        return;
      }
      await setDemoRole(role);
      router.push(homeFor(role));
      router.refresh();
    },
    /** 2FA tasdiqlangandan keyin */
    async complete(role: Role) {
      await setDemoRole(role);
      router.push(homeFor(role));
      router.refresh();
    },
  };
}
