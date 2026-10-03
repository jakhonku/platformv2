import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATALOG_KEYS, catalogHref, type CatalogKey } from "@/lib/catalog-keys";
import { cn } from "@/lib/utils";

export function CatalogTabs({ active }: { active: CatalogKey }) {
  const t = useTranslations("catalog.title");
  return (
    <nav aria-label={t(active)} className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1.5">
        {CATALOG_KEYS.map((key) => (
          <li key={key}>
            <Link
              href={catalogHref(key)}
              aria-current={key === active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium whitespace-nowrap transition-colors",
                key === active ? "border-primary bg-primary/10 text-primary" : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t(key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
