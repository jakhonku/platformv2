"use client";

import { useRef, useState } from "react";
import { Paperclip, Trash2 } from "@/components/icons";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatFileSize, MAX_PDF_FILES, validatePdf, type PdfUpload } from "@/lib/appeal-files";
import { cn } from "@/lib/utils";

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** PDF biriktirish: tanlash yoki sudrab tashlash; PDF, 3 MB gacha, 3 tagacha */
export function PdfPicker({ files, onChange, disabled }: { files: PdfUpload[]; onChange: (files: PdfUpload[]) => void; disabled?: boolean }) {
  const t = useTranslations("appeals.pdf");
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(list: FileList | File[] | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const next = [...files];
    for (const f of incoming) {
      if (next.length >= MAX_PDF_FILES) return setError(t("errors.count"));
      const verdict = validatePdf(f);
      if (verdict !== "ok") return setError(t(`errors.${verdict}`));
      try {
        next.push({ name: f.name, size: f.size, dataUrl: await readAsDataUrl(f) });
      } catch {
        return setError(t("errors.read"));
      }
    }
    setError(null);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) void add(e.dataTransfer.files);
        }}
        className={cn("flex flex-col items-start gap-2 rounded-xl border border-dashed p-3 transition-colors", dragging && "border-primary bg-primary/5")}
      >
        <input ref={input} type="file" accept="application/pdf,.pdf" multiple className="sr-only" aria-label={t("choose")} disabled={disabled} onChange={(e) => (void add(e.target.files), (e.target.value = ""))} />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={disabled || files.length >= MAX_PDF_FILES} onClick={() => input.current?.click()}>
            <Paperclip aria-hidden /> {t("choose")}
          </Button>
          <span className="text-xs text-muted-foreground">{t("drop")}</span>
        </div>
        <p className="text-xs text-muted-foreground">{t("hint")}</p>
      </div>
      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <Paperclip className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatFileSize(f.size)}</span>
              </span>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={t("remove")} disabled={disabled} onClick={() => onChange(files.filter((_, k) => k !== i))}>
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
