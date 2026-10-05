import { ShieldCheck } from "@/components/icons";
import { getTranslations } from "next-intl/server";
import { VerifyIdentityDialog } from "@/components/cabinet/verify-identity-dialog";
import type { DemoSubject } from "@/lib/demo/subject";

/** Tasdiqlanmagan hisob (faqat kuzatish rejimi) uchun kabinet tepasidagi eslatma */
export async function VerifyBanner({ subject }: { subject: DemoSubject }) {
  if (subject.role !== "member" || !subject.userId || subject.identityVerified) return null;
  const t = await getTranslations("onboarding.banner");
  return (
    <div role="status" className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-200">
      <div className="flex min-w-0 items-start gap-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div className="flex flex-col gap-0.5">
          <p className="font-medium">{t("title")}</p>
          <p>{t("text")}</p>
        </div>
      </div>
      <VerifyIdentityDialog userId={subject.userId} label={t("cta")} variant="outline" />
    </div>
  );
}
