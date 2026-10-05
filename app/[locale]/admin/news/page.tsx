import { getLocale, getTranslations } from "next-intl/server";
import { AdminGuard } from "@/components/admin/admin-guard";
import { BannersAdmin } from "@/components/admin/banners-admin";
import { NewsAdmin } from "@/components/admin/news-admin";
import { PageHeader } from "@/components/cabinet/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { canAccess } from "@/lib/admin-access";
import { getBanners, getNews, getReferences } from "@/lib/data";
import { getActorId, getDemoRole } from "@/lib/demo/server";
import { localized } from "@/lib/localized";
import type { LocaleCode } from "@/types/common";

export default async function AdminNewsPage() {
  const [t, role, actorId, locale] = await Promise.all([getTranslations("adminPage.news"), getDemoRole(), getActorId(), getLocale() as Promise<LocaleCode>]);
  const allowed = canAccess(role, "news");
  const [news, banners, refs] = allowed ? await Promise.all([getNews({}, 1, 100), getBanners(), getReferences()]) : [null, null, null];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <AdminGuard role={role} section="news">
        {news && banners && refs && (
          <Tabs defaultValue="news">
            <TabsList>
              <TabsTrigger value="news" className="px-3">{t("tabNews")} ({news.total})</TabsTrigger>
              <TabsTrigger value="banners" className="px-3">{t("tabBanners")} ({banners.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="news" className="pt-3">
              <NewsAdmin items={news.items} categories={refs.categories.filter((c) => c.kind === "news").map((c) => ({ value: c.id, label: localized(c.name, locale) }))} actorId={actorId} />
            </TabsContent>
            <TabsContent value="banners" className="pt-3">
              <BannersAdmin banners={banners} actorId={actorId} />
            </TabsContent>
          </Tabs>
        )}
      </AdminGuard>
    </div>
  );
}
