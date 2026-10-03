import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/layout/empty-state";
import { TalentCard } from "@/components/talent/talent-card";
import type { CollectiveMember } from "@/types/collective";
import type { TalentProfile } from "@/types/talent";

/** Tarkib guruh (partiya) bo'yicha; faqat tasdiqlangan ommaviy profili bor a'zolar ko'rsatiladi */
export function MembersList({ members, profiles }: { members: CollectiveMember[]; profiles: TalentProfile[] }) {
  const t = useTranslations("collectivePage");
  const byId = new Map(profiles.filter((p) => p.moderation === "approved").map((p) => [p.id, p]));

  const groups = new Map<string, TalentProfile[]>();
  for (const m of members) {
    const profile = byId.get(m.talentId);
    if (!profile) continue;
    groups.set(m.section, [...(groups.get(m.section) ?? []), profile]);
  }
  if (groups.size === 0) return <EmptyState title={t("noMembers")} />;

  return (
    <div className="flex flex-col gap-6">
      {[...groups].map(([section, list]) => (
        <div key={section} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {section} ({list.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <TalentCard key={p.id} talent={p} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
