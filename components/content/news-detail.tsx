import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { SectionBoundary } from "@/components/home/section-boundary";
import { CardSkeletons } from "@/components/layout/card-skeletons";
import { DetailShell } from "@/components/listing/detail-shell";
import { detailMetadata } from "@/components/listing/metadata";
import { InfoBlock } from "@/components/talent/profile-sections";
import { categoryById } from "@/lib/constants";
import { getNews } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { localized } from "@/lib/localized";
import { news as newsRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import { CoverImage } from "./cover-image";
import { loadNews } from "./load-content";
import { NewsCard } from "./news-card";

export async function newsMetadata(slug: string, locale: string): Promise<Metadata> {
  const item = await loadNews(slug);
  if (!item) return {};
  return detailMetadata({ title: item.title, description: item.excerpt, path: newsRoute(slug), locale, image: item.imageUrl, type: "article" });
}

async function OtherNews({ slug, categoryId, title }: { slug: string; categoryId: string; title: string }) {
  const { items } = await getNews({ categoryId }, 1, 4);
  const others = items.filter((n) => n.slug !== slug).slice(0, 3);
  if (others.length === 0) return null;
  return (
    <InfoBlock id="other-news" title={title}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((n) => (
          <NewsCard key={n.id} news={n} />
        ))}
      </div>
    </InfoBlock>
  );
}

export async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [item, t, locale] = await Promise.all([loadNews(slug), getTranslations("newsPage"), getLocale() as Promise<LocaleCode>]);
  if (!item) notFound();
  const category = categoryById(item.categoryId);
  const paragraphs = item.body.split(/\n{2,}|\n/).filter((p) => p.trim().length > 0);

  return (
    <DetailShell backHref="/news" backLabel={t("back")}>
      <article className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-2xl border">
          <CoverImage src={item.imageUrl} alt={item.title} />
        </div>
        <p className="text-sm text-muted-foreground">
          {category ? `${localized(category.name, locale)} · ` : ""}
          {formatDate(item.publishedAt, locale, "long")}
        </p>
        <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">{item.title}</h1>
        <div className="flex flex-col gap-3">
          {paragraphs.map((p, i) => (
            <p key={i} className="break-words text-base leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </article>
      <SectionBoundary fallback={<CardSkeletons count={3} />}>
        <OtherNews slug={item.slug} categoryId={item.categoryId} title={t("otherNews")} />
      </SectionBoundary>
    </DetailShell>
  );
}
