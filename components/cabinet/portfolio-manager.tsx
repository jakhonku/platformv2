"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { deleteCollection, deleteMedia, updateMedia } from "@/lib/data";
import type { Collection, MediaItem } from "@/types/media";
import { CollectionForm } from "./collection-form";
import { UploadDialog } from "./upload-dialog";

const TONE: Record<MediaItem["moderation"], Tone> = { pending: "yellow", approved: "green", rejected: "red" };

type Editing = { kind: "edit"; item: MediaItem } | { kind: "delete"; item: MediaItem } | { kind: "deleteCollection"; collection: Collection } | null;

export function PortfolioManager({ ownerId, ownerType, items, collections }: { ownerId: string; ownerType: "talent" | "collective"; items: MediaItem[]; collections: Collection[] }) {
  const t = useTranslations("cabinetPage.portfolio");
  const tm = useTranslations("cabinetPage.moderation");
  const tt = useTranslations("cabinetPage.upload.kinds");
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<unknown>, success: string) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      toast.success(success);
      setEditing(null);
      router.refresh();
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  }

  const titleOf = (id: string) => items.find((m) => m.id === id)?.title;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-xl text-sm text-muted-foreground">{t("moderationNote")}</p>
        <UploadDialog ownerId={ownerId} ownerType={ownerType} />
      </div>
      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items" className="px-3">
            {t("tabItems")} ({items.length})
          </TabsTrigger>
          <TabsTrigger value="collections" className="px-3">
            {t("tabCollections")} ({collections.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="pt-3">
          {items.length === 0 ? (
            <EmptyState title={t("emptyTitle")} text={t("emptyText")} />
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {items.map((m) => (
                <li key={m.id}>
                  <Card className="h-full gap-2 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="min-w-0 break-words text-sm font-semibold">{m.title}</p>
                      <StatusBadge tone={TONE[m.moderation]}>{tm(m.moderation)}</StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tt(m.type === "video" || m.type === "audio" ? m.type : "document")} ·{" "}
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-3" aria-hidden />
                        {m.views}
                      </span>
                    </p>
                    {m.description && <p className="line-clamp-3 break-words text-sm text-muted-foreground">{m.description}</p>}
                    <div className="mt-auto flex gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => (setTitle(m.title), setDescription(m.description), setEditing({ kind: "edit", item: m }))}>
                        <Pencil aria-hidden />
                        {t("edit")}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing({ kind: "delete", item: m })}>
                        <Trash2 aria-hidden />
                        {t("delete")}
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="collections" className="flex flex-col gap-4 pt-3">
          <CollectionForm ownerId={ownerId} items={items.map((m) => ({ id: m.id, title: m.title }))} />
          {collections.length === 0 ? (
            <EmptyState title={t("noCollections")} text={t("noCollectionsText")} />
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {collections.map((c) => (
                <li key={c.id}>
                  <Card className="h-full gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 break-words text-sm font-semibold">{c.title}</p>
                      <Button size="sm" variant="ghost" aria-label={t("deleteCollection")} onClick={() => setEditing({ kind: "deleteCollection", collection: c })}>
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                    {c.description && <p className="break-words text-sm text-muted-foreground">{c.description}</p>}
                    {c.itemIds.length === 0 ? (
                      <p className="text-xs text-muted-foreground">{t("emptyCollection")}</p>
                    ) : (
                      <ul className="flex flex-col gap-1 text-sm">
                        {c.itemIds.map((id) => (
                          <li key={id} className="truncate">
                            • {titleOf(id) ?? id}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={editing?.kind === "edit"} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editTitle")}</DialogTitle>
            <DialogDescription>{t("editText")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pm-title">{t("fieldTitle")}</Label>
            <Input id="pm-title" className="h-10" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pm-desc">{t("fieldDescription")}</Label>
            <Textarea id="pm-desc" rows={4} value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t("cancel")}
            </Button>
            <Button disabled={busy || title.trim().length < 2} onClick={() => editing?.kind === "edit" && run(() => updateMedia(editing.item.id, { title, description }), t("saved"))}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editing?.kind === "delete" || editing?.kind === "deleteCollection"} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.kind === "deleteCollection" ? t("deleteCollectionTitle") : t("deleteTitle")}</DialogTitle>
            <DialogDescription>{editing?.kind === "delete" ? t("deleteText", { title: editing.item.title }) : editing?.kind === "deleteCollection" ? t("deleteCollectionText", { title: editing.collection.title }) : ""}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => {
                if (editing?.kind === "delete") void run(() => deleteMedia(editing.item.id), t("deleted"));
                else if (editing?.kind === "deleteCollection") void run(() => deleteCollection(editing.collection.id), t("deleted"));
              }}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
