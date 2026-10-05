"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { applyToCasting, applyToVacancy, DataError } from "@/lib/data";
import type { Role } from "@/lib/demo/role";

export type ApplyTarget = { kind: "casting" | "vacancy"; id: string; title: string };
export type ApplyApplicant = { talentId: string; name: string; media: { id: string; title: string }[] };

type Values = { message: string; mediaIds: string[] };

export function ApplyDialog({ target, applicant, role, closed }: { target: ApplyTarget; applicant: ApplyApplicant | null; role: Role; closed: boolean }) {
  const t = useTranslations("opportunity.apply");
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  const schema = z.object({
    message: z.string().max(2000, t("errors.message")),
    mediaIds: z.array(z.string()).max(10, t("errors.media")),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { message: "", mediaIds: [] } });

  const onSubmit = handleSubmit(async (values) => {
    if (!applicant) return;
    const payload = { talentId: applicant.talentId, message: values.message.trim(), mediaIds: values.mediaIds };
    try {
      if (target.kind === "casting") await applyToCasting(target.id, payload);
      else await applyToVacancy(target.id, payload);
      toast.success(t("success"));
      setApplied(true);
      reset();
      setOpen(false);
    } catch (error) {
      // Forma qiymatlari saqlanadi: foydalanuvchi qayta urinib ko'ra oladi
      const code = error instanceof DataError ? error.code : undefined;
      toast.error(code === "duplicate" ? t("errors.duplicate") : code === "closed" ? t("errors.closed") : t("errors.generic"));
      if (code === "duplicate") setApplied(true);
    }
  });
  const onFormSubmit = useSingleSubmit(onSubmit);

  if (closed) return <Button disabled>{t("closed")}</Button>;
  if (applied)
    return (
      <Button disabled variant="outline">
        <Check aria-hidden />
        {t("applied")}
      </Button>
    );
  if (!applicant) {
    return role === "guest" ? (
      <Button nativeButton={false} render={<Link href="/login" />}>
        {t("loginToApply")}
      </Button>
    ) : (
      <p className="text-sm text-muted-foreground">{t("talentOnly")}</p>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Send aria-hidden />
        {t("cta")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description", { title: target.title, name: applicant.name })}</DialogDescription>
          </DialogHeader>
          <form onSubmit={onFormSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="apply-message">{t("message")}</Label>
              <Textarea
                id="apply-message"
                rows={5}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "apply-message-error" : undefined}
                {...register("message")}
              />
              {errors.message && (
                <p id="apply-message-error" className="text-xs text-destructive">
                  {errors.message.message}
                </p>
              )}
            </div>
            <fieldset className="flex min-w-0 flex-col gap-2">
              <legend className="mb-1 text-sm font-medium">{t("media")}</legend>
              {applicant.media.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noMedia")}</p>
              ) : (
                applicant.media.map((m) => (
                  <label key={m.id} className="flex min-w-0 cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" value={m.id} className="size-4 shrink-0 rounded border-input accent-primary" {...register("mediaIds")} />
                    <span className="truncate">{m.title}</span>
                  </label>
                ))
              )}
              {errors.mediaIds && <p className="text-xs text-destructive">{errors.mediaIds.message}</p>}
            </fieldset>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("sending") : t("submit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
