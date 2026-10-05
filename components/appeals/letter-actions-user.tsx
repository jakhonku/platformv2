"use client";

import { useState } from "react";
import { Send } from "@/components/icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import type { PdfUpload } from "@/lib/appeal-files";
import { addAppealMessage } from "@/lib/data/client";
import type { Appeal } from "@/types/appeal";
import { PdfPicker } from "./pdf-picker";

/** Foydalanuvchi: qo'shimcha xabar yoki (xat qaytarilgan bo'lsa) tuzatib qayta yuborish */
export function LetterActionsUser({ appeal, userId }: { appeal: Appeal; userId: string }) {
  const t = useTranslations("appeals.user");
  const router = useRouter();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<PdfUpload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const returned = appeal.status === "returned";

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (text.trim().length < 10 && files.length === 0) return setError(t("errors.content"));
    setPending(true);
    try {
      await addAppealMessage(userId, appeal.id, { text, files });
      toast.success(returned ? t("resent") : t("sentFollowUp"));
      setText("");
      setFiles([]);
      setError(null);
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    } finally {
      setPending(false);
    }
  });

  if (appeal.status === "closed") return <p className="text-sm text-muted-foreground print:hidden">{t("closedNote")}</p>;

  return (
    <Card className="gap-3 p-5 print:hidden">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="user-follow">{returned ? t("resend") : t("followUp")}</Label>
          {returned && <p className="text-sm text-muted-foreground">{t("resendHint")}</p>}
        </div>
        <Textarea id="user-follow" rows={4} value={text} maxLength={3000} onChange={(e) => (setText(e.target.value), setError(null))} />
        <PdfPicker files={files} onChange={(f) => (setFiles(f), setError(null))} disabled={pending} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-fit" disabled={pending}>
          <Send aria-hidden /> {returned ? t("resend") : t("send")}
        </Button>
      </form>
    </Card>
  );
}
