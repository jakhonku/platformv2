"use client";

import { use, useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { REGIONS } from "@/lib/constants";
import { localized } from "@/lib/localized";
import type { LocaleCode } from "@/types/common";
import type { Instrument, InstrumentFamily, Region, VoiceType } from "@/types/reference";
import type { TalentKind } from "@/types/talent";
import { SelectField, TextField } from "./filter-fields";
import { useUrlFilters } from "./use-url-filters";

export type FilterOptions = {
  regions: Region[];
  instruments: Instrument[];
  voiceTypes: VoiceType[];
  collectives: { id: string; name: string }[];
};

export type PanelKind = "talent" | "collective" | "organization";

const FAMILIES: InstrumentFamily[] = ["symphonic", "keyboard", "percussion", "folk", "jazz"];
const ORG_KINDS = ["philharmonic", "theatre", "conservatory", "college", "school", "festival_org", "agency"];
const EXPERIENCE = ["2", "5", "10", "20"];
const RESET_KEYS = ["q", "instrument", "voice", "specialty", "region", "city", "education", "exp", "collective", "availability", "verified", "kind"];
const AVAILABILITY = ["available", "open_to_offers", "busy"];

export function FilterPanel({
  kind,
  talentKind,
  optionsPromise,
  activeCount,
}: {
  kind: PanelKind;
  talentKind?: TalentKind;
  /** Server yuboradigan va-da kutiladigan promise: sahifa filtr ma'lumotlarini kutib bloklanmaydi */
  optionsPromise: Promise<FilterOptions>;
  activeCount: number;
}) {
  const options = use(optionsPromise);
  const t = useTranslations("catalog");
  const locale = useLocale() as LocaleCode;
  const { get, set, clear } = useUrlFilters();
  const tAvail = useTranslations("labels.availability");
  const verifiedId = useId();
  const region = get("region");
  const cities = REGIONS.find((r) => r.id === region)?.cities ?? [];
  const any = t("filters.any");

  const regionField = (
    <SelectField param="region" label={t("filters.region")} anyLabel={any} onChange={(v) => set({ region: v || undefined, city: undefined })}>
      {options.regions.map((r) => (
        <option key={r.id} value={r.id}>
          {localized(r.name, locale)}
        </option>
      ))}
    </SelectField>
  );
  const cityField =
    region && cities.length > 0 ? (
      <SelectField param="city" label={t("filters.city")} anyLabel={any}>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </SelectField>
    ) : null;
  const verifiedField = (
    <label htmlFor={verifiedId} className="flex cursor-pointer items-center gap-2 text-sm font-medium">
      <input
        id={verifiedId}
        type="checkbox"
        checked={get("verified") === "true"}
        onChange={(e) => set({ verified: e.target.checked ? "true" : undefined })}
        className="size-4 rounded border-input accent-primary"
      />
      {t("filters.verifiedOnly")}
    </label>
  );

  return (
    <form role="search" aria-label={t("filtersTitle")} onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t("filtersTitle")}</h2>
        {activeCount > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => clear(RESET_KEYS)}>
            {t("reset")}
          </Button>
        )}
      </div>

      <TextField param="q" label={t("filters.name")} placeholder={t("filters.namePlaceholder")} />

      {kind === "talent" && (
        <>
          <SelectField param="instrument" label={t("filters.instrument")} anyLabel={any}>
            {FAMILIES.map((family) => (
              <optgroup key={family} label={t(`instrumentFamily.${family}`)}>
                {options.instruments
                  .filter((i) => i.family === family)
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {localized(i.name, locale)}
                    </option>
                  ))}
              </optgroup>
            ))}
          </SelectField>
          {talentKind === "vocalist" && (
            <SelectField param="voice" label={t("filters.voiceType")} anyLabel={any}>
              {options.voiceTypes.map((v) => (
                <option key={v.id} value={v.id}>
                  {localized(v.name, locale)} ({v.range.low}–{v.range.high})
                </option>
              ))}
            </SelectField>
          )}
          <TextField param="specialty" label={t("filters.specialty")} />
          {regionField}
          {cityField}
          <TextField param="education" label={t("filters.education")} />
          <SelectField param="exp" label={t("filters.experience")} anyLabel={any}>
            {EXPERIENCE.map((n) => (
              <option key={n} value={n}>
                {t(`experienceOptions.${n}`)}
              </option>
            ))}
          </SelectField>
          <SelectField param="collective" label={t("filters.collective")} anyLabel={any}>
            {options.collectives.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <SelectField param="availability" label={t("filters.availability")} anyLabel={any}>
            {AVAILABILITY.map((a) => (
              <option key={a} value={a}>
                {tAvail(a)}
              </option>
            ))}
          </SelectField>
          {verifiedField}
        </>
      )}

      {kind === "collective" && (
        <>
          {regionField}
          {cityField}
          {verifiedField}
        </>
      )}

      {kind === "organization" && (
        <>
          <SelectField param="kind" label={t("filters.orgKind")} anyLabel={any}>
            {ORG_KINDS.map((k) => (
              <option key={k} value={k}>
                {t(`orgKind.${k}`)}
              </option>
            ))}
          </SelectField>
          {regionField}
        </>
      )}
    </form>
  );
}
