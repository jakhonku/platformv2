"use client";

import { useTranslations } from "next-intl";
import { NativeSelect } from "@/components/ui/native-select";

export const COVERS = [1, 2, 3, 4, 5, 6].map((n) => `/placeholders/cover-${n}.svg`);

/** Rasm tanlash: faqat loyiha ichidagi muqovalar (next/image tashqi domenlarsiz ishlaydi) */
export function CoverSelect({ id, value, onChange, optional }: { id: string; value: string; onChange: (v: string) => void; optional?: boolean }) {
  const t = useTranslations("adminPage.common");
  return (
    <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      {optional && <option value="">{t("noImage")}</option>}
      {COVERS.map((c, i) => (
        <option key={c} value={c}>
          {t("cover", { n: i + 1 })}
        </option>
      ))}
    </NativeSelect>
  );
}
