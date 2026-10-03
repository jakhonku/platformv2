import { useLocale } from "next-intl";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { categoryById } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { localized } from "@/lib/localized";
import { news as newsRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import type { NewsItem } from "@/types/content";
import { CoverImage } from "./cover-image";

export function NewsCard({ news }: { news: NewsItem }) {
  const locale = useLocale() as LocaleCode;
  const category = categoryById(news.categoryId);

  return (
    <Link href={newsRoute(news.slug)} className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
      <Card className="h-full gap-0 overflow-hidden p-0 transition-shadow group-hover:shadow-md">
        <CoverImage src={news.imageUrl} />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-xs text-muted-foreground">
            {category ? `${localized(category.name, locale)} · ` : ""}
            {formatDate(news.publishedAt, locale)}
          </p>
          <h3 className="line-clamp-2 text-sm font-semibold">{news.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{news.excerpt}</p>
        </div>
      </Card>
    </Link>
  );
}
