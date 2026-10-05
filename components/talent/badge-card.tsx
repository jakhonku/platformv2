"use client";

import Image from "next/image";
import { Download, ExternalLink, Send } from "@/components/icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Raqamli nishon: ko'rinish + yuklab olish (PNG) + LinkedIn/Instagram'ga ulashish */
export function BadgeCard({ slug, name, profilePath, owner = false }: { slug: string; name: string; profilePath: string; owner?: boolean }) {
  const t = useTranslations("onboarding.badge");
  const src = `/api/badge/${slug}`;

  const profileUrl = () => `${window.location.origin}${profilePath}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(profileUrl());
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl border shadow-md">
        <Image src={src} alt={t("alt", { name })} fill sizes="(min-width: 640px) 384px, 100vw" unoptimized />
      </div>
      {owner && (
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} className="h-10 rounded-full px-5" render={<a href={`${src}?download=1`} download />}>
            <Download aria-hidden /> {t("download")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full px-5"
            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl())}`, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink aria-hidden /> {t("linkedin")}
          </Button>
          <Button nativeButton={false} variant="outline" className="h-10 rounded-full px-5" render={<a href={`${src}?format=story&download=1`} download />}>
            <Send aria-hidden /> {t("instagram")}
          </Button>
          <Button type="button" variant="ghost" className="h-10 rounded-full px-4" onClick={copyLink}>
            {t("copyLink")}
          </Button>
        </div>
      )}
      {owner && <p className="max-w-md text-sm text-muted-foreground">{t("instagramHint")}</p>}
    </div>
  );
}
