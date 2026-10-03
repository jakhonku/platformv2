import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDemoRole } from "@/lib/demo/server";

export default async function AdminPage() {
  const t = await getTranslations();
  const role = await getDemoRole();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t("admin.title")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("demo.currentRole")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge>{t(`roles.${role}`)}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
