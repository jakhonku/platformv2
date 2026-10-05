"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { DEMO_OTP, MAX_OTP_ATTEMPTS, OTP_LENGTH } from "@/lib/auth/contact";
import { verifyCode } from "@/lib/data/client";
import { DataError } from "@/lib/data/errors";
import { OtpInput } from "./otp-input";

const RESEND_SECONDS = 30;
const LOCK_SECONDS = 30;

/**
 * Tasdiqlash kodi paneli (ro'yxatdan o'tish, parolni tiklash, 2FA uchun umumiy):
 * to'liq kod talab qilinadi, 5 xatodan keyin 30 s qulflanadi, qayta yuborish taymeri bor.
 */
export function OtpPanel({
  idPrefix,
  onVerified,
  showDemoCode,
  verify = verifyCode,
  submitLabel,
}: {
  idPrefix: string;
  onVerified: () => void | Promise<void>;
  showDemoCode: boolean;
  verify?: (code: string) => Promise<void>;
  submitLabel?: string;
}) {
  const t = useTranslations("auth");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [pending, setPending] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // Vaqt faqat klientda boshlanadi (hydration mos kelishi uchun)
  useEffect(() => {
    const tick = () => {
      const n = Date.now();
      setNow(n);
      setResendAt((prev) => prev ?? n + RESEND_SECONDS * 1000);
    };
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const left = (until: number | null) => (until && now ? Math.max(0, Math.ceil((until - now) / 1000)) : 0);
  const lockLeft = left(lockedUntil);
  const resendLeft = left(resendAt);
  const locked = lockLeft > 0;

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (locked) return;
    if (code.length < OTP_LENGTH) {
      setError(t("errors.code"));
      return;
    }
    setPending(true);
    try {
      await verify(code);
      setError(null);
      await onVerified();
    } catch (err) {
      if (err instanceof DataError && err.code === "invalid") {
        const used = attempts + 1;
        setAttempts(used);
        setCode("");
        if (used >= MAX_OTP_ATTEMPTS) {
          setAttempts(0);
          setLockedUntil(Date.now() + LOCK_SECONDS * 1000);
          setError(null);
        } else {
          setError(t("attemptsLeft", { count: MAX_OTP_ATTEMPTS - used }));
        }
      } else {
        setError(t("errors.generic"));
      }
    } finally {
      setPending(false);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <OtpInput idPrefix={idPrefix} value={code} onChange={(v) => { setCode(v); setError(null); }} invalid={!!error} disabled={locked || pending} />
      <div aria-live="polite" className="min-h-5 text-sm">
        {locked ? <p className="text-destructive">{t("locked", { seconds: lockLeft })}</p> : error && <p className="text-destructive">{error}</p>}
      </div>
      {showDemoCode && <p className="text-xs text-muted-foreground">{t("demoCode", { code: DEMO_OTP })}</p>}
      <Button type="submit" size="lg" disabled={pending || locked}>
        {pending ? t("verifying") : (submitLabel ?? t("verify"))}
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={resendLeft > 0}
        onClick={() => {
          setResendAt(Date.now() + RESEND_SECONDS * 1000);
          setError(null);
          toast.success(t("resent"));
        }}
      >
        {resendLeft > 0 ? t("resendIn", { seconds: resendLeft }) : t("resend")}
      </Button>
    </form>
  );
}
