import { useTranslations } from "next-intl";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import type { Availability } from "@/types/common";

const TONE: Record<Availability, Tone> = { available: "green", open_to_offers: "yellow", busy: "gray" };

export function AvailabilityBadge({ value }: { value: Availability }) {
  const t = useTranslations("labels.availability");
  return <StatusBadge tone={TONE[value]}>{t(value)}</StatusBadge>;
}
