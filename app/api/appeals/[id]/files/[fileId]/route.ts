import { getAppealFile } from "@/lib/data";
import { getDemoRole, getDemoSubject } from "@/lib/demo/server";

/** Xatga biriktirilgan PDF: faqat xat egasi yoki platforma admini ko'ra oladi */
export async function GET(request: Request, ctx: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await ctx.params;
  const file = await getAppealFile(id, fileId);
  if (!file) return new Response("Not found", { status: 404 });

  const [role, subject] = await Promise.all([getDemoRole(), getDemoSubject()]);
  if (role !== "admin" && subject.userId !== file.userId) return new Response("Forbidden", { status: 403 });

  const bytes = Buffer.from(file.data.slice(file.data.indexOf(",") + 1), "base64");
  const download = new URL(request.url).searchParams.get("download") === "1";
  const safeName = file.name.replace(/[^\w.\- ]+/g, "_");
  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
