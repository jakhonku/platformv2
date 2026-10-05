"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { OTP_LENGTH, sanitizeOtp } from "@/lib/auth/contact";
import { cn } from "@/lib/utils";

export function OtpInput({
  value,
  onChange,
  invalid,
  disabled,
  idPrefix,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  idPrefix: string;
}) {
  const t = useTranslations("auth");
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => refs.current[Math.min(Math.max(i, 0), OTP_LENGTH - 1)]?.focus();

  /** `from` katakchadan boshlab raqamlarni joylaydi (bitta raqam ham, paste ham shu yo'ldan o'tadi) */
  const put = (from: number, raw: string) => {
    const digits = sanitizeOtp(raw);
    if (!digits) return;
    const next = (value.slice(0, from) + digits).slice(0, OTP_LENGTH);
    onChange(next + value.slice(next.length));
    focus(from + digits.length);
  };

  return (
    <div className="flex justify-between gap-1.5 sm:gap-2" role="group" aria-label={t("otpLabel")}>
      {Array.from({ length: OTP_LENGTH }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          id={`${idPrefix}-${i}`}
          value={value[i] ?? ""}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={OTP_LENGTH}
          disabled={disabled}
          aria-label={t("otpDigit", { n: i + 1 })}
          aria-invalid={invalid || undefined}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            if (e.target.value === "") {
              onChange(value.slice(0, i) + value.slice(i + 1));
              return;
            }
            put(i, e.target.value);
          }}
          onPaste={(e) => {
            e.preventDefault();
            put(i, e.clipboardData.getData("text"));
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && i > 0) {
              e.preventDefault();
              onChange(value.slice(0, i - 1) + value.slice(i));
              focus(i - 1);
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              focus(i - 1);
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              focus(i + 1);
            }
          }}
          className={cn(
            "h-12 w-full min-w-0 rounded-lg border border-input bg-transparent text-center text-xl font-semibold outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
            invalid && "border-destructive ring-3 ring-destructive/20",
          )}
        />
      ))}
    </div>
  );
}
