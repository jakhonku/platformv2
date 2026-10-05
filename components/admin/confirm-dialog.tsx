"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** O`chirish kabi qaytarib bo`lmaydigan amallar uchun tasdiqlash dialogi */
export function ConfirmDialog({ open, title, text, busy, onConfirm, onClose }: { open: boolean; title: string; text: string; busy?: boolean; onConfirm: () => void; onClose: () => void }) {
  const t = useTranslations("adminPage.common");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{text}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" disabled={busy} onClick={onConfirm}>
            {t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
