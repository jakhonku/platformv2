import { ArrowLeft } from "@/components/icons";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LetterActionsUser } from "@/components/appeals/letter-actions-user";
import { LetterView } from "@/components/appeals/letter-view";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { PageHeader } from "@/components/cabinet/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getAppealById } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";

const ROLES = ["member", "musician", "vocalist", "conductor", "composer", "collective", "organization"] as const;

export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, t, subject] = await Promise.all([params, getTranslations("appeals.letter"), getDemoSubject()]);
  const appeal = subject.userId ? await getAppealById(id) : null;
  // Boshqa foydalanuvchining xati ochilmaydi
  if (subject.userId && (!appeal || appeal.userId !== subject.userId)) notFound();
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        title={appeal ? `№ ${appeal.number}` : t("number")}
        actions={
          <Button nativeButton={false} variant="outline" className="print:hidden" render={<Link href="/cabinet/appeals" />}>
            <ArrowLeft aria-hidden /> {t("back")}
          </Button>
        }
      />
      <CabinetGuard subject={subject} allow={ROLES}>
        {appeal && subject.userId && (
          <>
            <LetterView appeal={appeal} viewer="user" />
            <LetterActionsUser key={`${appeal.id}-${appeal.updatedAt}`} appeal={appeal} userId={subject.userId} />
          </>
        )}
      </CabinetGuard>
    </div>
  );
}
