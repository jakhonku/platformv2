"use client";

import { useRef, useState } from "react";
import { FileUp, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { addMedia } from "@/lib/data";
import { formatBytes, parseYoutubeId, UPLOAD_RULES, validateUpload, type UploadKind } from "@/lib/upload";
import { cn } from "@/lib/utils";

const KINDS: UploadKind[] = ["video", "audio", "document"];

/** Fayl yuklash (drag-and-drop UI, haqiqiy yuklash yo'q) yoki YouTube havolasi qo'shish */
export function UploadDialog({ ownerId, ownerType }: { ownerId: string; ownerType: "talent" | "collective" }) {
  const t = useTranslations("cabinetPage.upload");
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"file" | "youtube">("file");
  const [kind, setKind] = useState<UploadKind>("video");
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [youtube, setYoutube] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rule = UPLOAD_RULES[kind];
  const limitText = t("limit", { formats: rule.extensions.join(", ").toUpperCase(), size: formatBytes(rule.maxBytes) });

  function reset() {
    setFile(null);
    setYoutube("");
    setTitle("");
    setDescription("");
    setError(null);
  }

  function pick(f: File | undefined) {
    if (!f) return;
    const verdict = validateUpload(kind, f.name, f.size);
    if (!verdict.ok) {
      setFile(null);
      setError(t(`errors.${verdict.reason}`, { formats: rule.extensions.join(", ").toUpperCase(), size: formatBytes(rule.maxBytes) }));
      return;
    }
    setError(null);
    setFile({ name: f.name, size: f.size });
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  }

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (title.trim().length < 2) return setError(t("errors.title"));
    if (mode === "youtube") {
      if (!parseYoutubeId(youtube)) return setError(t("errors.youtube"));
    } else if (!file) {
      return setError(t("errors.noFile"));
    }
    try {
      await addMedia(ownerId, ownerType, {
        kind: mode === "youtube" ? "video" : kind,
        title,
        description,
        ...(mode === "youtube" ? { youtube } : { fileName: file!.name, sizeBytes: file!.size }),
      });
      toast.success(t("success"));
      reset();
      setOpen(false);
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    }
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Upload aria-hidden />
        {t("cta")}
      </Button>
      <Dialog open={open} onOpenChange={(o) => (setOpen(o), o || reset())}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <Tabs value={mode} onValueChange={(v) => (setMode(v as "file" | "youtube"), setError(null))}>
              <TabsList>
                <TabsTrigger value="file">{t("tabFile")}</TabsTrigger>
                <TabsTrigger value="youtube">{t("tabYoutube")}</TabsTrigger>
              </TabsList>
              <TabsContent value="file" className="flex flex-col gap-3 pt-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="up-kind">{t("kind")}</Label>
                  <NativeSelect id="up-kind" value={kind} onChange={(e) => (setKind(e.target.value as UploadKind), setFile(null), setError(null))}>
                    {KINDS.map((k) => (
                      <option key={k} value={k}>
                        {t(`kinds.${k}`)}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div
                  onDragOver={(e) => (e.preventDefault(), setDragging(true))}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => (e.preventDefault(), setDragging(false), pick(e.dataTransfer.files[0]))}
                  className={cn("flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors", dragging ? "border-primary bg-primary/5" : "bg-muted/40")}
                >
                  <FileUp className="size-8 text-muted-foreground" aria-hidden />
                  <p className="text-sm font-medium">{t("drop")}</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
                    {t("choose")}
                  </Button>
                  <input ref={input} type="file" className="sr-only" tabIndex={-1} accept={rule.extensions.map((x) => `.${x}`).join(",")} onChange={(e) => (pick(e.target.files?.[0]), (e.target.value = ""))} />
                  <p className="text-xs text-muted-foreground">{limitText}</p>
                  {file && (
                    <p className="max-w-full break-all text-sm" aria-live="polite">
                      {file.name} · {formatBytes(file.size)}
                    </p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="youtube" className="flex flex-col gap-1.5 pt-3">
                <Label htmlFor="up-youtube">{t("youtube")}</Label>
                <Input id="up-youtube" className="h-10" inputMode="url" placeholder="https://youtu.be/…" value={youtube} onChange={(e) => (setYoutube(e.target.value), setError(null))} />
              </TabsContent>
            </Tabs>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="up-title">{t("fieldTitle")}</Label>
              <Input id="up-title" className="h-10" value={title} maxLength={120} onChange={(e) => (setTitle(e.target.value), setError(null))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="up-desc">{t("fieldDescription")}</Label>
              <Textarea id="up-desc" rows={3} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div aria-live="polite" className="min-h-0">
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit">{t("submit")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
