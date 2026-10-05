"use client";

import { useRef, useState } from "react";
import { Download, FileUp } from "@/components/icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "@/i18n/navigation";
import { importCollectiveMembers, importOrganizationStaff } from "@/lib/data/client";
import { MAX_IMPORT_ROWS, parseCsv, parseMemberRows, type ParsedMembers } from "@/lib/import/members";
import { formatBytes } from "@/lib/upload";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
type Summary = { matched: number; unmatched: number; duplicates: number };

/** Fayl (.xlsx yoki .csv) → qatorlar. Excel katakchalari matnga aylantiriladi (telefon raqamlari son bo`lib keladi). */
async function readRows(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) return parseCsv(await file.text());
  if (name.endsWith(".xlsx")) {
    const { readSheet } = await import("read-excel-file/browser");
    const sheet = await readSheet(file);
    return sheet.map((row) => row.map((cell) => (typeof cell === "number" ? String(Math.trunc(cell)) : cell == null ? "" : String(cell))));
  }
  throw new Error("format");
}

/**
 * Jamoa a`zolari yoki tashkilot xodimlarini Excel/CSV orqali ommaviy import:
 * fayl brauzerda o`qiladi, ko`rib chiqiladi va faqat tasdiqlangach saqlanadi.
 */
export function MembersImport({ kind, targetId }: { kind: "collective" | "organization"; targetId: string }) {
  const t = useTranslations("cabinetPage.import");
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [parsed, setParsed] = useState<ParsedMembers | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Summary | null>(null);
  const [dragging, setDragging] = useState(false);

  function reset() {
    setFileInfo(null);
    setParsed(null);
    setError(null);
    setResult(null);
  }

  async function pick(file: File | undefined) {
    if (!file) return;
    reset();
    if (file.size > MAX_BYTES) return setError(t("errors.size", { size: formatBytes(MAX_BYTES) }));
    if (!/\.(xlsx|csv)$/i.test(file.name)) return setError(t("errors.format"));
    setBusy(true);
    try {
      const rows = await readRows(file);
      const result = parseMemberRows(rows);
      if (result.total === 0) return setError(t("errors.empty"));
      setFileInfo({ name: file.name, size: file.size });
      setParsed(result);
    } catch {
      setError(t("errors.read"));
    } finally {
      setBusy(false);
    }
  }

  function downloadTemplate() {
    const header = t(kind === "collective" ? "template.headerCollective" : "template.headerOrganization");
    const csv = `﻿${header}\n${t("template.row1")}\n${t("template.row2")}\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = kind === "collective" ? "jamoa-azolari-shablon.csv" : "xodimlar-shablon.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function confirm() {
    if (!parsed || parsed.rows.length === 0 || parsed.tooMany || busy) return;
    setBusy(true);
    try {
      const summary = kind === "collective" ? await importCollectiveMembers(targetId, parsed.rows) : await importOrganizationStaff(targetId, parsed.rows);
      setResult(summary);
      setParsed(null);
      setFileInfo(null);
      toast.success(t("imported"));
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="gap-4 p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t(kind === "collective" ? "descriptionCollective" : "descriptionOrganization")}</p>
        <p className="text-xs text-muted-foreground">{t("columnsHint", { max: MAX_IMPORT_ROWS })}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
          <Download aria-hidden />
          {t("downloadTemplate")}
        </Button>
        <Button type="button" size="sm" disabled={busy} onClick={() => input.current?.click()}>
          <FileUp aria-hidden />
          {t("chooseFile")}
        </Button>
        <input ref={input} type="file" className="sr-only" tabIndex={-1} accept=".xlsx,.csv" onChange={(e) => (void pick(e.target.files?.[0]), (e.target.value = ""))} />
      </div>

      <div
        onDragOver={(e) => (e.preventDefault(), setDragging(true))}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => (e.preventDefault(), setDragging(false), void pick(e.dataTransfer.files[0]))}
        className={cn("rounded-xl border-2 border-dashed p-4 text-center text-sm text-muted-foreground transition-colors", dragging ? "border-primary bg-primary/5" : "bg-muted/40")}
      >
        {busy && !parsed ? t("reading") : fileInfo ? `${fileInfo.name} · ${formatBytes(fileInfo.size)}` : t("drop")}
      </div>

      <div aria-live="polite" className="flex flex-col gap-3">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {parsed && (
          <>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-muted px-3 py-1">{t("summary.total", { count: parsed.total })}</span>
              <span className="rounded-full bg-green-50 dark:bg-green-500/10 px-3 py-1 text-green-700 dark:text-green-300">{t("summary.valid", { count: parsed.rows.length })}</span>
              {parsed.errors.length > 0 && <span className="rounded-full bg-red-50 dark:bg-red-500/10 px-3 py-1 text-red-700 dark:text-red-300">{t("summary.errors", { count: parsed.errors.length })}</span>}
            </div>
            {parsed.tooMany && <p className="text-sm text-destructive">{t("tooMany", { max: MAX_IMPORT_ROWS })}</p>}

            {parsed.rows.length > 0 && (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">{t("columns.name")}</th>
                      <th className="px-3 py-2 font-medium">{t("columns.phone")}</th>
                      <th className="px-3 py-2 font-medium">{t("columns.section")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.slice(0, 10).map((r) => (
                      <tr key={r.phone} className="border-t">
                        <td className="px-3 py-1.5">{r.name}</td>
                        <td className="px-3 py-1.5 whitespace-nowrap">{r.phone}</td>
                        <td className="px-3 py-1.5">{r.section || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.rows.length > 10 && <p className="border-t px-3 py-1.5 text-xs text-muted-foreground">{t("more", { count: parsed.rows.length - 10 })}</p>}
              </div>
            )}

            {parsed.errors.length > 0 && (
              <details className="rounded-lg border p-3 text-sm">
                <summary className="cursor-pointer font-medium">{t("errorsTitle", { count: parsed.errors.length })}</summary>
                <ul className="mt-2 flex flex-col gap-1 text-xs">
                  {parsed.errors.slice(0, 50).map((e) => (
                    <li key={`${e.line}-${e.reason}`}>{t("errorLine", { line: e.line, reason: t(`reasons.${e.reason}`) })}</li>
                  ))}
                </ul>
              </details>
            )}

            <div className="flex flex-wrap gap-2">
              <Button disabled={busy || parsed.rows.length === 0 || parsed.tooMany} onClick={confirm}>
                {busy ? t("importing") : t("confirm", { count: parsed.rows.length })}
              </Button>
              <Button variant="outline" disabled={busy} onClick={reset}>
                {t("cancel")}
              </Button>
            </div>
          </>
        )}

        {result && (
          <div role="status" className="flex flex-col gap-1 rounded-lg border border-green-200 dark:border-green-400/25 bg-green-50 dark:bg-green-500/10 p-3 text-sm text-green-800 dark:text-green-300">
            <p className="font-medium">{t("resultTitle")}</p>
            <p>{t(kind === "collective" ? "resultCollective" : "resultOrganization", result)}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
