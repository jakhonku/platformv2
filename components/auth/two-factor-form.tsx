"use client";

import type { Role } from "@/lib/demo/role";
import { OtpPanel } from "./otp-panel";
import { useSignIn } from "./use-sign-in";

/** Tashkilot, moderator va administrator uchun ikki bosqichli tasdiqlash */
export function TwoFactorForm({ role, showDemoCode }: { role: Role; showDemoCode: boolean }) {
  const signIn = useSignIn();
  return <OtpPanel idPrefix="twofactor" showDemoCode={showDemoCode} onVerified={() => signIn.complete(role)} />;
}
