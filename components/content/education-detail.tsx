import type { Metadata } from "next";
import { CalendarDays, Clock, Wallet } from "@/components/icons";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { SectionBoundary } from "@/components/home/section-boundary";
import { CardSkeletons } from "@/components/layout/card-skeletons";
import { DetailShell } from "@/components/listing/detail-shell";
import { detailMetadata } from "@/components/listing/metadata";
import { InfoBlock } from "@/components/talent/profile-sections";
import { TalentCard } from "@/components/talent/talent-card";
import { AppIcon } from "@/components/ui/app-icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTalentById } from "@/lib/data";
import { formatDate, formatMoneyUzs } from "@/lib/format";
import { masterClass as masterClassRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import { CoverImage } from "./cover-image";
import { loadMasterClass } from "./load-content";

export async function educationMetadata(slug: string, locale: string): Promise<Metadata> {
  const item = await loadMasterClass(slug);
  if (!item) return {};
  return detailMetadata({ title: item.title, description: item.description, path: masterClassRoute(slug), locale, image: item.imageUrl });
}

async function Teacher({ id, title }: { id: string; title: string }) {
  const teacher = await getTalentById(id);
  if (!teacher || teacher.moderation !== "approved") return null;
  return (
    <InfoBlock id="teacher" title={title}>
      <div className="max-w-md">
        <TalentCard talent={teacher} />
      </div>
    </InfoBlock>
  );
}

export async function EducationDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [item, t, tf, locale] = await Promise.all([loadMasterClass(slug), getTranslations("educationPage"), getTranslations("listing.format"), getLocale() as Promise<LocaleCode>]);
  if (!item) notFound();

  return (
    <DetailShell backHref="/education" backLabel={t("back")}>
      <div className="glass-strong overflow-hidden rounded-[2rem]">
        <CoverImage src={item.imageUrl} alt={item.title} />
        <div className="flex flex-col gap-3 p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="blue">{tf(item.format)}</StatusBadge>
            <StatusBadge tone={item.seats > 0 ? "green" : "red"}>{item.seats > 0 ? t("seatsLeft", { count: item.seats }) : t("noSeats")}</StatusBadge>
          </div>
          <h1 className="break-words text-3xl font-semibold tracking-tight sm:text-4xl">{item.title}</h1>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={CalendarDays} size="sm" />
              {formatDate(item.date, locale, "long")}
            </span>
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={Clock} size="sm" />
              {t("duration")}: {t("hours", { count: item.durationHours })}
            </span>
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={Wallet} size="sm" />
              {t("price")}: {item.priceUzs > 0 ? formatMoneyUzs(item.priceUzs, locale) : t("free")}
            </span>
          </div>
        </div>
      </div>
      <p className="glass whitespace-pre-line break-words rounded-3xl p-5 text-sm leading-relaxed sm:p-6">{item.description}</p>
      <SectionBoundary fallback={<CardSkeletons count={1} />}>
        <Teacher id={item.teacherId} title={t("teacher")} />
      </SectionBoundary>
    </DetailShell>
  );
}
