"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "@/components/icons";
import { useTranslations } from "next-intl";
import { flexRender, type RowData } from "@tanstack/react-table";
import { getCoreRowModel, getSortedRowModel, useLegacyTable, type LegacyColumnDef } from "@tanstack/react-table/legacy";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const norm = (s: string) => s.toLowerCase().replace(/[ʻʼ'’`]/g, "").trim();

/** Kichik, tez xesh: ma`lumot imzosi uchun (kalit sifatida) */
function hash(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

type ViewProps<T extends RowData> = {
  data: T[];
  columns: LegacyColumnDef<T>[];
  getRowId: (row: T) => string;
  mobileCard: (row: T) => React.ReactNode;
  pageSize: number;
  page: number;
  onPage: (page: number) => void;
};

/** TanStack jadvali (tartiblash) + sahifalash; mobilda kartochkalar */
function TableView<T extends RowData>({ data, columns, getRowId, mobileCard, pageSize, page, onPage }: ViewProps<T>) {
  const t = useTranslations("adminPage.table");
  const table = useLegacyTable({ data, columns, getRowId, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  const rows = table.getRowModel().rows;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = rows.slice(current * pageSize, (current + 1) * pageSize);

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => {
                  const sorted = h.column.getIsSorted();
                  return (
                    <TableHead key={h.id} aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}>
                      {h.isPlaceholder ? null : h.column.getCanSort() ? (
                        <button type="button" onClick={h.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 font-medium hover:text-foreground">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {sorted === "asc" ? <ArrowUp className="size-3.5" aria-hidden /> : sorted === "desc" ? <ArrowDown className="size-3.5" aria-hidden /> : null}
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {visible.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="flex flex-col gap-3 md:hidden">
        {visible.map((row) => (
          <li key={row.id}>{mobileCard(row.original)}</li>
        ))}
      </ul>
      {pages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {t("page", { current: current + 1, total: pages })}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={current === 0} onClick={() => onPage(current - 1)}>
              <ChevronLeft aria-hidden />
              {t("prev")}
            </Button>
            <Button size="sm" variant="outline" disabled={current >= pages - 1} onClick={() => onPage(current + 1)}>
              {t("next")}
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Admin jadvali: TanStack Table (tartiblash), apostrofsiz qidiruv, sahifalash.
 * Mobilda (md dan kichik) jadval o`rniga kartochkalar.
 */
export function DataTable<T extends RowData>({
  data,
  columns,
  getRowId,
  searchText,
  mobileCard,
  pageSize = 10,
  emptyTitle,
}: {
  data: T[];
  columns: LegacyColumnDef<T>[];
  getRowId: (row: T) => string;
  searchText?: (row: T) => string;
  mobileCard: (row: T) => React.ReactNode;
  pageSize?: number;
  emptyTitle: string;
}) {
  const t = useTranslations("adminPage.table");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = norm(query);
    return q && searchText ? data.filter((row) => norm(searchText(row)).includes(q)) : data;
  }, [data, query, searchText]);
  // useLegacyTable (v9) satr modelini data o`zgarganda yangilamaydi: ma`lumot imzosi o`zgarsa jadval qayta yaratiladi
  const signature = useMemo(() => hash(JSON.stringify(filtered)), [filtered]);

  return (
    <div className="flex flex-col gap-3">
      {searchText && (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input type="search" value={query} onChange={(e) => (setQuery(e.target.value), setPage(0))} placeholder={t("search")} aria-label={t("search")} className="h-9 pl-8" />
        </div>
      )}
      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle} text={query ? t("noMatches") : undefined} />
      ) : (
        <TableView key={signature} data={filtered} columns={columns} getRowId={getRowId} mobileCard={mobileCard} pageSize={pageSize} page={page} onPage={setPage} />
      )}
    </div>
  );
}
