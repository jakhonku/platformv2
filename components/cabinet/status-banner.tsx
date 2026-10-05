import { Clock, XCircle } from "@/components/icons";
import { getTranslations } from "next-intl/server";
import type { DemoSubject } from "@/lib/demo/subject";

/** Yozuv moderator tomonidan tasdiqlanmaguncha (yoki rad etilgan bo`lsa) kabinet tepasida ko`rinadi */
export async function StatusBanner({ subject }: { subject: DemoSubject }) {
  const entity = subject.talent
    ? { status: subject.talent.moderation, note: subject.talent.moderationNote }
    : subject.collective
      ? { status: subject.collective.moderation, note: subject.collective.moderationNote }
      : subject.organization
        ? { status: subject.organization.verification, note: subject.organization.moderationNote }
        : null;
  if (!entity || entity.status === "approved") return null;

  const t = await getTranslations("cabinetPage.banner");
  const rejected = entity.status === "rejected";
  const Icon = rejected ? XCircle : Clock;
  return (
    <div role="status" className={`mb-4 flex items-start gap-3 rounded-xl border p-3 text-sm ${rejected ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="font-medium">{t(rejected ? "rejectedTitle" : "pendingTitle")}</p>
        <p>{t(rejected ? "rejectedText" : "pendingText")}</p>
        {rejected && entity.note && <p className="break-words">{t("reason", { reason: entity.note })}</p>}
      </div>
    </div>
  );
}
