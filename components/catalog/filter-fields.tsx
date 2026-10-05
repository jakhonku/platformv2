"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useUrlFilters } from "./use-url-filters";

export function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Matn maydoni: 400 ms kechikish bilan URL'ga `replace` qiladi; URL tashqaridan o'zgarsa (tozalash) yangilanadi */
export function TextField({ param, label, placeholder }: { param: string; label: string; placeholder?: string }) {
  const { get, set } = useUrlFilters();
  const id = useId();
  const urlValue = get(param);
  const [value, setValue] = useState(urlValue);
  const committed = useRef(urlValue);

  useEffect(() => {
    if (urlValue !== committed.current) {
      committed.current = urlValue;
      setValue(urlValue);
    }
  }, [urlValue]);

  useEffect(() => {
    if (value === committed.current) return;
    const timer = setTimeout(() => {
      committed.current = value.trim();
      set({ [param]: value.trim() || undefined }, { replace: true });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Field label={label} htmlFor={id}>
      <Input id={id} type="search" value={value} placeholder={placeholder} onChange={(e) => setValue(e.target.value)} maxLength={100} />
    </Field>
  );
}

export function SelectField({
  param,
  label,
  anyLabel,
  children,
  onChange,
}: {
  param: string;
  label: string;
  anyLabel: string;
  children: React.ReactNode;
  onChange?: (value: string) => void;
}) {
  const { get, set } = useUrlFilters();
  const id = useId();
  return (
    <Field label={label} htmlFor={id}>
      <NativeSelect id={id} value={get(param)} onChange={(e) => (onChange ? onChange(e.target.value) : set({ [param]: e.target.value || undefined }))}>
        <option value="">{anyLabel}</option>
        {children}
      </NativeSelect>
    </Field>
  );
}
