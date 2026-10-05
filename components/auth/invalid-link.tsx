import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { AuthHeading } from "./auth-heading";

/** Noto'g'ri/yo'q query parametrlari uchun xavfsiz fallback */
export async function InvalidLink({ href = "/register" }: { href?: string }) {
  const t = await getTranslations("auth.invalidLink");
  return (
    <div className="flex flex-col gap-4">
      <AuthHeading title={t("title")} text={t("text")} />
      <Button nativeButton={false} render={<Link href={href} />}>
        {t("cta")}
      </Button>
    </div>
  );
}
