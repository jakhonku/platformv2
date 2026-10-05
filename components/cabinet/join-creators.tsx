"use client";

import { useState } from "react";
import { MicFill, MusicFill, PenLineFill, SparklesFill, type Icon } from "@/components/icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/app-icon";
import { useRouter } from "@/i18n/navigation";
import { joinCreators } from "@/lib/data/client";
import { signInAs } from "@/lib/demo/actions";
import { cn } from "@/lib/utils";

type Kind = "musician" | "vocalist" | "conductor" | "composer";
const KINDS: { kind: Kind; icon: Icon }[] = [
  { kind: "musician", icon: MusicFill },
  { kind: "vocalist", icon: MicFill },
  { kind: "conductor", icon: SparklesFill },
  { kind: "composer", icon: PenLineFill },
];

/** Tasdiqlangan foydalanuvchi ijodkor turini tanlab, ijodkorlarga qo'shiladi */
export function JoinCreators({ userId }: { userId: string }) {
  const t = useTranslations("onboarding.join");
  const router = useRouter();
  const [kind, setKind] = useState<Kind | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!kind || pending) return;
    setPending(true);
    try {
      const { role } = await joinCreators(userId, kind);
      await signInAs(role, userId);
      toast.success(t("success"));
      router.push("/cabinet/profile");
      router.refresh();
    } catch {
      toast.error(t("error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label={t("title")} className="grid gap-2.5 sm:grid-cols-2">
        {KINDS.map(({ kind: k, icon }) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              kind === k ? "border-primary bg-primary/10" : "hover:bg-muted",
            )}
          >
            <AppIcon icon={icon} size="md" />
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-medium">{t(`kinds.${k}.title`)}</span>
              <span className="text-xs text-muted-foreground">{t(`kinds.${k}.text`)}</span>
            </span>
          </button>
        ))}
      </div>
      <Button type="button" className="h-11 w-fit rounded-full px-6" disabled={!kind || pending} onClick={submit}>
        {pending ? t("submitting") : t("submit")}
      </Button>
    </div>
  );
}
