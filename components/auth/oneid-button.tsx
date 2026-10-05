"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSignIn } from "./use-sign-in";

/** OneID (mock): musiqachi sifatida kiradi */
export function OneIdButton() {
  const t = useTranslations("auth");
  const signIn = useSignIn();
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={async () => {
        toast.success(t("oneIdToast"));
        await signIn.afterCredentials("musician");
      }}
    >
      <ShieldCheck aria-hidden />
      {t("oneId")}
    </Button>
  );
}
