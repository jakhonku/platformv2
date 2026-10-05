"use client";

import type { Role } from "@/lib/demo/role";
import { OtpPanel } from "./otp-panel";
import { useSignIn } from "./use-sign-in";

/** Tashkilot, moderator va administrator uchun ikki bosqichli tasdiqlash */
export function TwoFactorForm({ role, userId, showDemoCode }: { role: Role; userId?: string; showDemoCode: boolean }) {
  const signIn = useSignIn();
  return <OtpPanel idPrefix="twofactor" showDemoCode={showDemoCode} onVerified={() => signIn.complete(role, userId)} />;
}
