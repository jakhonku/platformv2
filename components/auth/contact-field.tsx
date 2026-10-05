"use client";

import { Input } from "@/components/ui/input";
import { formatPhoneInput } from "@/lib/auth/contact";

/** Telefon (niqob bilan) yoki email kiritish maydoni */
export function ContactField({
  channel,
  value,
  onChange,
  id,
  error,
}: {
  channel: "phone" | "email";
  value: string;
  onChange: (value: string) => void;
  id: string;
  error?: string;
}) {
  const common = { id, value, "aria-invalid": !!error, "aria-describedby": error ? `${id}-error` : undefined, className: "h-10" };
  return channel === "phone" ? (
    <Input {...common} type="tel" inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67" onChange={(e) => onChange(formatPhoneInput(e.target.value))} />
  ) : (
    <Input {...common} type="email" inputMode="email" autoComplete="email" placeholder="name@example.uz" onChange={(e) => onChange(e.target.value)} />
  );
}
