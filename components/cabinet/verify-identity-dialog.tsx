"use client";

import { useState } from "react";
import { ShieldCheck } from "@/components/icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FormField } from "@/components/auth/form-field";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { verifyIdentity } from "@/lib/data/client";
import { DataError } from "@/lib/data/errors";

/** OneID orqali shaxsni tasdiqlash (demo: PINFL kiritiladi) */
export function VerifyIdentityDialog({ userId, label, variant = "default" }: { userId: string; label?: string; variant?: "default" | "outline" }) {
  const t = useTranslations("onboarding.verifyDialog");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pinfl, setPinfl] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (!/^\d{14}$/.test(pinfl)) return setError(t("errors.pinfl"));
    setPending(true);
    try {
      await verifyIdentity(userId, pinfl);
      toast.success(t("success"));
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof DataError && err.code === "duplicate" ? t("errors.duplicate") : t("errors.generic"));
    } finally {
      setPending(false);
    }
  });

  return (
    <>
      <Button type="button" variant={variant} className="h-10 rounded-full px-5" onClick={() => setOpen(true)}>
        <ShieldCheck aria-hidden /> {label ?? t("cta")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("text")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <FormField id="oneid-pinfl" label={t("pinfl")} hint={t("pinflHint")} error={error}>
              <Input
                id="oneid-pinfl"
                inputMode="numeric"
                autoComplete="off"
                maxLength={14}
                placeholder="14 raqam"
                value={pinfl}
                aria-invalid={!!error}
                onChange={(e) => {
                  setPinfl(e.target.value.replace(/\D/g, "").slice(0, 14));
                  setError(undefined);
                }}
                className="h-10 tracking-wider"
              />
            </FormField>
            <Button type="submit" size="lg" className="h-11 rounded-full" disabled={pending}>
              {pending ? t("submitting") : t("submit")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
