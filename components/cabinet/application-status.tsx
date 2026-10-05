import { useTranslations } from "next-intl";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import type { ApplicationStatus } from "@/types/opportunity";

export const APPLICATION_TONE: Record<ApplicationStatus, Tone> = {
  submitted: "gray",
  viewed: "blue",
  shortlisted: "yellow",
  invited: "blue",
  accepted: "green",
  rejected: "red",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const t = useTranslations("cabinetPage.status");
  return <StatusBadge tone={APPLICATION_TONE[status]}>{t(status)}</StatusBadge>;
}
