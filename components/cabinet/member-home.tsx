import { Check, Lock } from "@/components/icons";
import { getTranslations } from "next-intl/server";
import { JoinCreators } from "@/components/cabinet/join-creators";
import { VerifyIdentityDialog } from "@/components/cabinet/verify-identity-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DemoSubject } from "@/lib/demo/subject";
import { cn } from "@/lib/utils";

function StepMark({ state, n }: { state: "done" | "active" | "locked"; n: number }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        state === "done" && "bg-green-500/15 text-green-700 dark:text-green-300",
        state === "active" && "bg-primary text-primary-foreground",
        state === "locked" && "bg-muted text-muted-foreground",
      )}
    >
      {state === "done" ? <Check className="size-4" /> : state === "locked" ? <Lock className="size-3.5" /> : n}
    </span>
  );
}

/** Ijodkor bo'lmagan (`member`) foydalanuvchi bosh sahifasi: tasdiqlash bosqichlari */
export async function MemberHome({ subject }: { subject: DemoSubject }) {
  const t = await getTranslations("onboarding.member");
  const userId = subject.userId!;
  const verified = subject.identityVerified === true;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-start gap-3">
          <StepMark state="done" n={1} />
          <div className="grid gap-1">
            <CardTitle>{t("steps.account.title")}</CardTitle>
            <CardDescription>{t("steps.account.text")}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start gap-3">
          <StepMark state={verified ? "done" : "active"} n={2} />
          <div className="grid gap-1">
            <CardTitle>{verified ? t("steps.verify.done") : t("steps.verify.title")}</CardTitle>
            {!verified && <CardDescription>{t("steps.verify.text")}</CardDescription>}
          </div>
        </CardHeader>
        {!verified && (
          <CardContent>
            <VerifyIdentityDialog userId={userId} />
          </CardContent>
        )}
      </Card>

      <Card className={cn(!verified && "opacity-70")}>
        <CardHeader className="flex-row items-start gap-3">
          <StepMark state={verified ? "active" : "locked"} n={3} />
          <div className="grid gap-1">
            <CardTitle>{t("steps.join.title")}</CardTitle>
            <CardDescription>{verified ? t("steps.join.text") : t("steps.join.locked")}</CardDescription>
          </div>
        </CardHeader>
        {verified && (
          <CardContent>
            <JoinCreators userId={userId} />
          </CardContent>
        )}
      </Card>

      <Card className="opacity-70">
        <CardHeader className="flex-row items-start gap-3">
          <StepMark state="locked" n={4} />
          <div className="grid gap-1">
            <CardTitle>{t("steps.badge.title")}</CardTitle>
            <CardDescription>{t("steps.badge.text")}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
