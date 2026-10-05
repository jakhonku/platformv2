"use client";

import { useRef } from "react";
import type { Role } from "@/lib/demo/role";
import { verifyAndActivate } from "@/lib/data/client";
import { OtpPanel } from "./otp-panel";
import { useSignIn } from "./use-sign-in";

/** Ro`yxatdan o`tishdan keyingi kodni tasdiqlash: hisob faollashadi, kirgan foydalanuvchi sifatida kabinetga o`tadi */
export function VerifyForm({ contact, role, showDemoCode }: { contact: string; role: Role; showDemoCode: boolean }) {
  const signIn = useSignIn();
  const result = useRef<{ userId: string; role: Role } | null>(null);
  return (
    <OtpPanel
      idPrefix="verify"
      showDemoCode={showDemoCode}
      verify={async (code) => {
        result.current = await verifyAndActivate(contact, code);
      }}
      onVerified={() => signIn.afterCredentials(result.current?.role ?? role, result.current?.userId)}
    />
  );
}
