"use client";

import { useState } from "react";
import { Search } from "@/components/icons";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/layout/empty-state";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Appeal, AppealStatus } from "@/types/appeal";
import { AppealKindBadge, AppealStatusBadge } from "./appeal-badges";
import { formatDateTime } from "./appeal-thread";

const TABS: (AppealStatus | "all")[] = ["all", "new", "in_review", "answered", "returned", "closed"];

/** Admin: xatlar ro'yxati (navbat tartibida), holat bo'yicha tablar va qidiruv; xat alohida sahifada ochiladi */
export function AppealsAdmin({ appeals }: { appeals: Appeal[] }) {
  const t = useTranslations("appeals.admin");
  const ts = useTranslations("appeals.status");
  const tr = useTranslations("roles");
  const tu = useTranslations("appeals.user");
  const [tab, setTab] = useState<AppealStatus | "all">("new");
  const [query, setQuery] = useState("");

  const count = (s: AppealStatus | "all") => (s === "all" ? appeals.length : appeals.filter((a) => a.status === s).length);
  const q = query.trim().toLowerCase();
  const list = appeals.filter((a) => (tab === "all" || a.status === tab) && (!q || `${a.number} ${a.subject} ${a.authorName}`.toLowerCase().includes(q)));

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label={t("title")} className="flex flex-wrap gap-1.5">
        {TABS.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={tab === s}
            onClick={() => setTab(s)}
            className={cn("inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50", tab === s ? "border-transparent bg-primary text-primary-foreground" : "hover:bg-muted")}
          >
            {s === "all" ? t("all") : ts(s)}
            <span className="tabular-nums opacity-70">{count(s)}</span>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search")} aria-label={t("search")} className="pl-8" />
      </div>

      {list.length === 0 ? (
        <EmptyState title={t("emptyTitle")} text={t("emptyText")} />
      ) : (
        <ul className="flex flex-col gap-3" aria-label={t("list")}>
          {list.map((a, i) => (
            <li key={a.id}>
              <Link href={`/admin/appeals/${a.id}`} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
                <Card className="gap-2 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-4">
                  <span className="font-mono text-sm font-semibold tracking-wide sm:w-40 sm:shrink-0">{a.number}</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-sm font-semibold break-words">{a.subject}</span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {a.authorName} · {tr(a.authorRole)}
                      </span>
                      <span>{formatDateTime(a.createdAt)}</span>
                      <AppealKindBadge kind={a.kind} />
                    </span>
                  </span>
                  <span className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {a.status === "new" && <StatusBadge tone="gray">{tu("queueBadge", { n: tab === "new" ? i + 1 : (a.queuePosition ?? 1) })}</StatusBadge>}
                    <AppealStatusBadge status={a.status} />
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
