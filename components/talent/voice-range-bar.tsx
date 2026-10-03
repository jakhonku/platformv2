import { useLocale, useTranslations } from "next-intl";
import { voiceTypeById } from "@/lib/constants";
import { localized } from "@/lib/localized";
import { rangeBar } from "@/lib/voice-range";
import type { LocaleCode } from "@/types/common";

/** Ovoz turi va diapazoni; chiziq faqat nota yozuvi to'g'ri bo'lsa chiziladi, aks holda faqat matn */
export function VoiceRangeBar({ voiceTypeId, range }: { voiceTypeId?: string; range?: { low: string; high: string } }) {
  const t = useTranslations("profile");
  const locale = useLocale() as LocaleCode;
  const voice = voiceTypeId ? voiceTypeById(voiceTypeId) : undefined;
  if (!voice && !range) return null;
  const bar = range ? rangeBar(range.low, range.high) : null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        {voice && <span className="font-medium">{localized(voice.name, locale)}</span>}
        {range && (
          <span className="text-muted-foreground">
            {voice ? " · " : ""}
            {range.low} – {range.high}
          </span>
        )}
      </p>
      {bar && range && (
        <div role="img" aria-label={`${t("voiceRange")}: ${range.low} – ${range.high}`} className="relative h-2 w-full rounded-full bg-muted">
          <div className="absolute h-2 rounded-full bg-primary" style={{ left: `${bar.left}%`, width: `${bar.width}%` }} />
        </div>
      )}
    </div>
  );
}
