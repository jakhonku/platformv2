import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Brand } from "./brand";
import { PUBLIC_NAV } from "./nav-items";

export async function PublicFooter() {
  const t = await getTranslations();
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-3 py-8 sm:px-6">
        <div className="flex flex-col gap-3">
          <Brand />
          <p className="text-sm text-muted-foreground">{t("app.slogan")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {PUBLIC_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("app.shortName")}. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
