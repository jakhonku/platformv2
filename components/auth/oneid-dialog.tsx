"use client";

import { useState } from "react";
import { ShieldCheck } from "@/components/icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { oneIdSignIn } from "@/lib/data/client";
import { DataError } from "@/lib/data/errors";
import type { Role } from "@/lib/demo/role";
import { cn } from "@/lib/utils";
import { useSignIn } from "./use-sign-in";

type Kind = "individual" | "legal";
const ROLES: Record<Kind, Role[]> = {
  individual: ["musician", "vocalist", "conductor", "composer", "collective"],
  legal: ["organization", "collective"],
};

/**
 * OneID (mock): jismoniy shaxs PINFL, yuridik shaxs STIR bilan aniqlanadi. Mavjud hisob bo`lsa kiradi,
 * yo`q bo`lsa hisob yaratiladi (shaxsi tasdiqlangan), yozuvni esa moderator tasdiqlaydi.
 */
export function OneIdDialog() {
  const t = useTranslations("auth.oneIdDialog");
  const tr = useTranslations("roles");
  const signIn = useSignIn();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("individual");
  const [pinfl, setPinfl] = useState("");
  const [stir, setStir] = useState("");
  const [name, setName] = useState("");
  const [entityName, setEntityName] = useState("");
  const [role, setRole] = useState<Role>("musician");
  const [error, setError] = useState<string | null>(null);
  const needsEntity = role === "organization" || role === "collective";

  const set = <T,>(setter: (v: T) => void) => (v: T) => (setter(v), setError(null));

  function chooseKind(k: Kind) {
    setKind(k);
    setRole(ROLES[k][0]);
    setError(null);
  }

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (kind === "individual" ? !/^\d{14}$/.test(pinfl) : !/^\d{9}$/.test(stir)) return setError(t(kind === "individual" ? "errors.pinfl" : "errors.stir"));
    if (name.trim().length < 2) return setError(t("errors.name"));
    if (needsEntity && entityName.trim().length < 2) return setError(t("errors.entityName"));
    try {
      const res =
        kind === "individual"
          ? await oneIdSignIn({ type: "individual", pinfl, fullName: name, role, entityName: needsEntity ? entityName : undefined })
          : await oneIdSignIn({ type: "legal", stir, entityName: entityName || name, representative: name, role });
      toast.success(t(res.isNew ? "createdToast" : "signedInToast"));
      setOpen(false);
      await signIn.afterCredentials(res.role, res.userId);
    } catch (err) {
      const code = err instanceof DataError ? err.code : undefined;
      setError(code === "forbidden" ? t("errors.forbidden") : code === "invalid" || code === "duplicate" ? t("errors.invalid") : t("errors.generic"));
    }
  });

  return (
    <>
      <Button type="button" variant="outline" size="lg" onClick={() => setOpen(true)}>
        <ShieldCheck aria-hidden />
        {t("cta")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("text")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <div role="radiogroup" aria-label={t("kind")} className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(["individual", "legal"] as const).map((k) => (
                <label key={k} className={cn("flex h-9 cursor-pointer items-center justify-center rounded-md text-sm font-medium focus-within:ring-3 focus-within:ring-ring/50", kind === k ? "bg-background shadow-sm" : "text-muted-foreground")}>
                  <input type="radio" name="oneid-kind" value={k} checked={kind === k} onChange={() => chooseKind(k)} className="sr-only" />
                  {t(k)}
                </label>
              ))}
            </div>
            {kind === "individual" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="oneid-pinfl">{t("pinfl")}</Label>
                <Input id="oneid-pinfl" className="h-10" inputMode="numeric" maxLength={14} value={pinfl} onChange={(e) => set(setPinfl)(e.target.value.replace(/\D/g, ""))} />
                <p className="text-xs text-muted-foreground">{t("pinflHint")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="oneid-stir">{t("stir")}</Label>
                <Input id="oneid-stir" className="h-10" inputMode="numeric" maxLength={9} value={stir} onChange={(e) => set(setStir)(e.target.value.replace(/\D/g, ""))} />
                <p className="text-xs text-muted-foreground">{t("stirHint")}</p>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="oneid-name">{t(kind === "individual" ? "fullName" : "representative")}</Label>
              <Input id="oneid-name" className="h-10" value={name} maxLength={80} onChange={(e) => set(setName)(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="oneid-role">{t("role")}</Label>
              <NativeSelect id="oneid-role" value={role} onChange={(e) => (setRole(e.target.value as Role), setError(null))}>
                {ROLES[kind].map((r) => (
                  <option key={r} value={r}>
                    {tr(r)}
                  </option>
                ))}
              </NativeSelect>
            </div>
            {needsEntity && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="oneid-entity">{t(role === "organization" ? "organizationName" : "collectiveName")}</Label>
                <Input id="oneid-entity" className="h-10" value={entityName} maxLength={120} onChange={(e) => set(setEntityName)(e.target.value)} />
              </div>
            )}
            <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">{t("moderationNote")}</p>
            <div aria-live="polite">{error && <p className="text-sm text-destructive">{error}</p>}</div>
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
