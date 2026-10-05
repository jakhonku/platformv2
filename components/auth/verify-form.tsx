"use client";

import type { Role } from "@/lib/demo/role";
import { OtpPanel } from "./otp-panel";
import { useSignIn } from "./use-sign-in";

/** Ro'yxatdan o'tishdan keyingi kodni tasdiqlash */
export function VerifyForm({ role, showDemoCode }: { role: Role; showDemoCode: boolean }) {
  const signIn = useSignIn();
  return <OtpPanel idPrefix="verify" showDemoCode={showDemoCode} onVerified={() => signIn.afterCredentials(role)} />;
}
