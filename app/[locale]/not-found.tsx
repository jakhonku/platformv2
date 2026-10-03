import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">{t("notFoundTitle")}</h1>
      <Button nativeButton={false} render={<Link href="/" />}>
        {t("backHome")}
      </Button>
    </main>
  );
}
