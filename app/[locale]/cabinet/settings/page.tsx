import { ArrowLeft, UserRound } from "@/components/icons";
import { getTranslations } from "next-intl/server";
import { AvatarUpload } from "@/components/cabinet/avatar-upload";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { NotificationSettings } from "@/components/cabinet/notification-settings";
import { PageHeader } from "@/components/cabinet/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getNotificationSettings } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";
import { avatarOwner, publicProfileHref, subjectPhotoUrl } from "@/lib/demo/subject-links";

const ROLES = ["member", "musician", "vocalist", "conductor", "composer", "collective", "organization"] as const;

/** Har bir foydalanuvchining shaxsiy sozlamalari: profil rasmi, hisob va bildirishnoma kanallari */
export default async function SettingsPage() {
  const [t, tr, subject] = await Promise.all([getTranslations("cabinetPage.settings"), getTranslations("roles"), getDemoSubject()]);
  const key = subject.userId ?? subject.collective?.id ?? "";
  const initial = key ? await getNotificationSettings(key) : null;
  const owner = avatarOwner(subject);
  const photo = subjectPhotoUrl(subject);
  const publicHref = publicProfileHref(subject);
  const individual = !!subject.talent;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <>
            <Button nativeButton={false} variant="outline" render={<Link href="/" />}>
              <ArrowLeft aria-hidden /> {t("backHome")}
            </Button>
            <Button nativeButton={false} render={<Link href={publicHref ?? "/cabinet/profile"} />}>
              <UserRound aria-hidden /> {t("backProfile")}
            </Button>
          </>
        }
      />
      <CabinetGuard subject={subject} allow={ROLES}>
        <div className="grid max-w-3xl gap-6">
          {owner && photo && (
          <Card>
            <CardHeader>
              <CardTitle>{t("photo.title")}</CardTitle>
              <CardDescription>
                {subject.name} · {tr(subject.role)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvatarUpload key={owner.id} owner={owner} name={subject.name} currentUrl={photo} rounded={individual} />
            </CardContent>
          </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t("notificationsTitle")}</CardTitle>
              <CardDescription>{t("notificationsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>{initial && <NotificationSettings key={key} settingsKey={key} initial={initial} />}</CardContent>
          </Card>
        </div>
      </CabinetGuard>
    </div>
  );
}
