"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "@/components/icons";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendInvitation } from "@/lib/data/client";

type Values = { senderName: string; contact: string; message: string };

export function InviteDialog({ talentId, talentName }: { talentId: string; talentName: string }) {
  const t = useTranslations("invite");
  const [open, setOpen] = useState(false);

  const schema = z.object({
    senderName: z.string().trim().min(2, t("errors.senderName")).max(80, t("errors.senderName")),
    contact: z.string().trim().min(5, t("errors.contact")).max(120, t("errors.contact")),
    message: z.string().trim().min(10, t("errors.message")).max(1000, t("errors.message")),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { senderName: "", contact: "", message: "" } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await sendInvitation(talentId, values);
      toast.success(t("success"));
      reset();
      setOpen(false);
    } catch {
      // Forma qiymatlari saqlanadi: foydalanuvchi qayta urinib ko'ra oladi
      toast.error(t("error"));
    }
  });

  const onFormSubmit = useSingleSubmit(onSubmit);

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
            <DialogDescription>{t("description", { name: talentName })}</DialogDescription>
          </DialogHeader>
          <form onSubmit={onFormSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-sender">{t("senderName")}</Label>
              <Input
                id="invite-sender"
                autoComplete="name"
                aria-invalid={!!errors.senderName}
                aria-describedby={errors.senderName ? "invite-sender-error" : undefined}
                {...register("senderName")}
              />
              {errors.senderName && (
                <p id="invite-sender-error" className="text-xs text-destructive">
                  {errors.senderName.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-contact">{t("contact")}</Label>
              <Input
                id="invite-contact"
                autoComplete="email"
                aria-invalid={!!errors.contact}
                aria-describedby={errors.contact ? "invite-contact-error" : undefined}
                {...register("contact")}
              />
              {errors.contact && (
                <p id="invite-contact-error" className="text-xs text-destructive">
                  {errors.contact.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-message">{t("message")}</Label>
              <Textarea
                id="invite-message"
                rows={5}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "invite-message-error" : undefined}
                {...register("message")}
              />
              {errors.message && (
                <p id="invite-message-error" className="text-xs text-destructive">
                  {errors.message.message}
                </p>
              )}
            </div>
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
