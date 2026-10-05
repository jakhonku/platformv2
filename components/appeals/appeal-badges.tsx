import { useTranslations } from "next-intl";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import type { AppealKind, AppealStatus } from "@/types/appeal";

const TONE: Record<AppealStatus, Tone> = { new: "yellow", in_review: "blue", answered: "green", returned: "red", closed: "gray" };

export function AppealStatusBadge({ status }: { status: AppealStatus }) {
  const t = useTranslations("appeals.status");
  return <StatusBadge tone={TONE[status]}>{t(status)}</StatusBadge>;
}

export function AppealKindBadge({ kind }: { kind: AppealKind }) {
  const t = useTranslations("appeals.kind");
  return <StatusBadge tone="gray">{t(kind)}</StatusBadge>;
}
