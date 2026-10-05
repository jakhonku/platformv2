"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { deleteReference, saveReference } from "@/lib/data/client";
import { localized } from "@/lib/localized";
import type { ReferenceKind } from "@/types/admin";
import type { LocaleCode, LocalizedText } from "@/types/common";
import type { Category, Instrument, Region, VoiceType } from "@/types/reference";
import { ConfirmDialog } from "./confirm-dialog";
import { DataTable } from "./data-table";

type Row = { id: string; name: LocalizedText; extra: string; raw: Instrument | VoiceType | Region | Category };
const KINDS: ReferenceKind[] = ["instrument", "voiceType", "region", "category"];
const FAMILIES = ["symphonic", "folk", "jazz", "keyboard", "percussion"] as const;
const CATEGORY_KINDS = ["talent", "news", "event"] as const;
const NOTE = /^[A-G][#b]?\d$/;

function toRows(kind: ReferenceKind, lists: { instruments: Instrument[]; voiceTypes: VoiceType[]; regions: Region[]; categories: Category[] }): Row[] {
  switch (kind) {
    case "instrument":
      return lists.instruments.map((x) => ({ id: x.id, name: x.name, extra: x.family, raw: x }));
    case "voiceType":
      return lists.voiceTypes.map((x) => ({ id: x.id, name: x.name, extra: `${x.range.low}–${x.range.high}`, raw: x }));
    case "region":
      return lists.regions.map((x) => ({ id: x.id, name: x.name, extra: String(x.cities.length), raw: x }));
    case "category":
      return lists.categories.map((x) => ({ id: x.id, name: x.name, extra: x.kind, raw: x }));
  }
}

function ReferenceForm({ kind, initial, actorId, onClose }: { kind: ReferenceKind; initial: Row | null; actorId: string; onClose: () => void }) {
  const t = useTranslations("adminPage.references");
  const router = useRouter();
  const raw = initial?.raw as (Instrument & VoiceType & Region & Category) | undefined;
  const [name, setName] = useState<LocalizedText>(initial?.name ?? { uz: "", ru: "", en: "" });
  const [family, setFamily] = useState<(typeof FAMILIES)[number]>(raw && "family" in raw ? raw.family : "symphonic");
  const [low, setLow] = useState(raw && "range" in raw ? raw.range.low : "C3");
  const [high, setHigh] = useState(raw && "range" in raw ? raw.range.high : "C5");
  const [cities, setCities] = useState(raw && "cities" in raw ? raw.cities.join("\n") : "");
  const [catKind, setCatKind] = useState<(typeof CATEGORY_KINDS)[number]>(raw && "kind" in raw ? raw.kind : "talent");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (!name.uz.trim() || !name.ru.trim() || !name.en.trim()) return setError(t("errors.names"));
    if (kind === "voiceType" && !(NOTE.test(low) && NOTE.test(high))) return setError(t("errors.range"));
    try {
      await saveReference(
        kind,
        {
          id: initial?.id,
          name,
          ...(kind === "instrument" ? { family } : {}),
          ...(kind === "voiceType" ? { range: { low, high } } : {}),
          ...(kind === "region" ? { cities: cities.split("\n").map((c) => c.trim()).filter(Boolean) } : {}),
          ...(kind === "category" ? { kind: catKind } : {}),
        },
        actorId,
      );
      toast.success(t("saved"));
      onClose();
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? t("editTitle") : t("createTitle")}</DialogTitle>
          <DialogDescription>{t(`kinds.${kind}`)}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          {(["uz", "ru", "en"] as const).map((l) => (
            <div key={l} className="flex flex-col gap-1.5">
              <Label htmlFor={`ref-${l}`}>{t("name", { lang: l.toUpperCase() })}</Label>
              <Input id={`ref-${l}`} className="h-10" value={name[l]} maxLength={120} onChange={(e) => (setName((n) => ({ ...n, [l]: e.target.value })), setError(null))} />
            </div>
          ))}
          {kind === "instrument" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ref-family">{t("family")}</Label>
              <NativeSelect id="ref-family" value={family} onChange={(e) => setFamily(e.target.value as (typeof FAMILIES)[number])}>
                {FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </NativeSelect>
            </div>
          )}
          {kind === "voiceType" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ref-low">{t("low")}</Label>
                <Input id="ref-low" className="h-10" value={low} maxLength={4} onChange={(e) => (setLow(e.target.value), setError(null))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ref-high">{t("high")}</Label>
                <Input id="ref-high" className="h-10" value={high} maxLength={4} onChange={(e) => (setHigh(e.target.value), setError(null))} />
              </div>
            </div>
          )}
          {kind === "region" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ref-cities">{t("cities")}</Label>
              <Textarea id="ref-cities" rows={4} value={cities} onChange={(e) => setCities(e.target.value)} />
            </div>
          )}
          {kind === "category" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ref-kind">{t("categoryKind")}</Label>
              <NativeSelect id="ref-kind" value={catKind} onChange={(e) => setCatKind(e.target.value as (typeof CATEGORY_KINDS)[number])}>
                {CATEGORY_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </NativeSelect>
            </div>
          )}
          <div aria-live="polite">{error && <p className="text-sm text-destructive">{error}</p>}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ReferencesAdmin({ instruments, voiceTypes, regions, categories, actorId }: { instruments: Instrument[]; voiceTypes: VoiceType[]; regions: Region[]; categories: Category[]; actorId: string }) {
  const t = useTranslations("adminPage.references");
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [kind, setKind] = useState<ReferenceKind>("instrument");
  const [form, setForm] = useState<{ kind: ReferenceKind; initial: Row | null; key: number } | null>(null);
  const [deleting, setDeleting] = useState<{ kind: ReferenceKind; row: Row } | null>(null);
  const [busy, setBusy] = useState(false);
  const lists = { instruments, voiceTypes, regions, categories };

  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      await deleteReference(deleting.kind, deleting.row.id, actorId);
      toast.success(t("deleted"));
      setDeleting(null);
      router.refresh();
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setBusy(false);
    }
  }

  const table = (k: ReferenceKind) => {
    const actions = (r: Row) => (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setForm({ kind: k, initial: r, key: Date.now() })}>
          <Pencil aria-hidden />
          {t("edit")}
        </Button>
        <Button size="sm" variant="ghost" aria-label={t("delete")} onClick={() => setDeleting({ kind: k, row: r })}>
          <Trash2 aria-hidden />
        </Button>
      </div>
    );
    const columns: LegacyColumnDef<Row>[] = [
      { accessorKey: "id", header: "ID", cell: ({ row }) => <code className="text-xs">{row.original.id}</code> },
      { id: "name", header: t("nameColumn"), accessorFn: (r) => localized(r.name, locale) },
      { accessorKey: "extra", header: t(`extra.${k}`) },
      { id: "actions", header: "", enableSorting: false, cell: ({ row }) => actions(row.original) },
    ];
    return (
      <DataTable
        data={toRows(k, lists)}
        columns={columns}
        getRowId={(r) => r.id}
        searchText={(r) => `${r.id} ${r.name.uz} ${r.name.ru} ${r.name.en}`}
        emptyTitle={t("empty")}
        pageSize={12}
        mobileCard={(r) => (
          <Card className="gap-1 p-4">
            <p className="text-sm font-semibold">{localized(r.name, locale)}</p>
            <p className="text-xs text-muted-foreground">
              <code>{r.id}</code> · {r.extra}
            </p>
            {actions(r)}
          </Card>
        )}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={kind} onValueChange={(v) => setKind(v as ReferenceKind)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="max-w-full overflow-x-auto">
            <TabsList>
              {KINDS.map((k) => (
                <TabsTrigger key={k} value={k} className="px-3">
                  {t(`kinds.${k}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <Button onClick={() => setForm({ kind, initial: null, key: Date.now() })}>
            <Plus aria-hidden />
            {t("add")}
          </Button>
        </div>
        {KINDS.map((k) => (
          <TabsContent key={k} value={k} className="pt-3">
            {table(k)}
          </TabsContent>
        ))}
      </Tabs>
      {form && <ReferenceForm key={form.key} kind={form.kind} initial={form.initial} actorId={actorId} onClose={() => setForm(null)} />}
      <ConfirmDialog open={!!deleting} title={t("deleteTitle")} text={t("deleteText", { name: deleting ? localized(deleting.row.name, locale) : "" })} busy={busy} onClose={() => setDeleting(null)} onConfirm={remove} />
    </div>
  );
}
