"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Trash2, Upload } from "@/components/icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { setAvatar } from "@/lib/data/client";
import { cn } from "@/lib/utils";

type Owner = { type: "talent" | "collective" | "organization"; id: string };

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;
const SIZE = 512;

/** Rasmni markazdan kvadratga qirqib, 512×512 JPEG data URL'ga aylantiradi */
async function toSquareDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    bitmap.close();
  }
}

/** Profil rasmini yuklash: tanlash yoki sudrab tashlash, ko'rib chiqish, saqlash, standartga qaytarish */
export function AvatarUpload({ owner, name, currentUrl, rounded = true }: { owner: Owner; name: string; currentUrl: string; rounded?: boolean }) {
  const t = useTranslations("cabinetPage.settings.photo");
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    if (!ACCEPT.includes(file.type)) return setError(t("errorType"));
    if (file.size > MAX_BYTES) return setError(t("errorSize"));
    try {
      setPreview(await toSquareDataUrl(file));
      setError(null);
    } catch {
      setError(t("errorRead"));
    }
  }

  async function commit(url: string | null) {
    if (busy) return;
    setBusy(true);
    try {
      await setAvatar(owner, url);
      setPreview(null);
      toast.success(url ? t("saved") : t("removed"));
      router.refresh();
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  }

  const shown = preview ?? currentUrl;
  const shape = rounded ? "rounded-full" : "rounded-3xl";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void pick(e.dataTransfer.files[0]);
        }}
        className={cn("relative size-32 shrink-0 overflow-hidden ring-4 ring-border transition-shadow", shape, dragging && "ring-primary")}
      >
        <Image src={shown} alt={name} fill sizes="128px" unoptimized={shown.startsWith("data:")} className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <p className="text-sm text-muted-foreground">{t("hint")}</p>
        <input ref={input} type="file" accept={ACCEPT.join(",")} className="sr-only" aria-label={t("upload")} onChange={(e) => void pick(e.target.files?.[0])} />
        {preview ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={busy} onClick={() => void commit(preview)}>
              {busy ? t("saving") : t("save")}
            </Button>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setPreview(null)}>
              {t("cancel")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
              <Upload aria-hidden /> {t("upload")}
            </Button>
            <Button type="button" variant="ghost" disabled={busy} onClick={() => void commit(null)}>
              <Trash2 aria-hidden /> {t("remove")}
            </Button>
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
