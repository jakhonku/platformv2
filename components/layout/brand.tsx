import { Music } from "@/components/icons";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Brand({ href = "/" }: { href?: string }) {
  const t = useTranslations("app");
  return (
    <Link href={href} className="flex min-w-0 items-center gap-2.5">
      <span className="icon-glass squircle flex size-9 shrink-0 items-center justify-center text-primary">
        <Music className="size-4.5" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">{t("shortName")}</span>
        <span className="truncate text-xs text-muted-foreground">Orchestra &amp; Choir</span>
      </span>
    </Link>
  );
}
