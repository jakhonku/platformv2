import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { ConductorProfile } from "@/types/talent";

export function ConductorEnsembles({ conductor }: { conductor: ConductorProfile }) {
  const t = useTranslations("labels.collectiveType");
  return (
    <div className="flex flex-wrap gap-2">
      {conductor.ensembleTypes.map((type) => (
        <Badge key={type} variant="secondary">
          {t(type)}
        </Badge>
      ))}
    </div>
  );
}
