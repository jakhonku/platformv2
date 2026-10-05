import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { badgeCode, hasBadge } from "@/lib/badge";
import { getTalentBySlug } from "@/lib/data";

const KIND_LABEL = { musician: "MUSIQACHI", vocalist: "VOKALIST", conductor: "DIRIJYOR", composer: "KOMPOZITOR" } as const;

const GOLD = "#e3c98f";
const GOLD_GRADIENT = "linear-gradient(135deg, #f6e4b0 0%, #c59a47 48%, #f1dc9f 100%)";
const NAVY = "#14263f";

// Playfair Display (SIL OFL): assets/fonts; next.config'dagi outputFileTracingIncludes build'ga qo'shadi
const loadFont = (file: string) => readFile(path.join(process.cwd(), "assets", "fonts", file));
const fonts = Promise.all([loadFont("playfair-display-latin-500-normal.woff"), loadFont("playfair-display-latin-700-normal.woff")]);

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

/**
 * Raqamli nishon (PNG): kvadrat 1080×1080 (post, LinkedIn) yoki `?format=story` — 1080×1920 (Instagram hikoya).
 * `?download=1` — faylni yuklab olish. Faqat tasdiqlangan ijodkorlar uchun.
 */
export async function GET(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const talent = await getTalentBySlug(slug).catch(() => null);
  if (!talent || !hasBadge(talent)) return new Response("Not found", { status: 404 });

  const params = new URL(request.url).searchParams;
  const story = params.get("format") === "story";
  const download = params.get("download") === "1";
  const width = 1080;
  const height = story ? 1920 : 1080;
  const [medium, bold] = await fonts;

  const issued = (talent.badgeIssuedAt ?? talent.createdAt).slice(0, 10);
  const photo = talent.photoUrl.startsWith("data:image/") ? talent.photoUrl : null;
  const medal = story ? 440 : 296;
  const len = talent.fullName.length;
  const nameSize = Math.round((len <= 14 ? 104 : len <= 20 ? 88 : len <= 28 ? 72 : 58) * (story ? 1.05 : 1));
  const flex = { display: "flex" } as const;

  const image = new ImageResponse(
    (
      <div style={{ ...flex, position: "relative", width: "100%", height: "100%", background: "linear-gradient(165deg, #1d3658 0%, #12233b 52%, #0b1524 100%)", fontFamily: "Playfair" }}>
        {/* nota chizig'i: fonda 5 ta ingichka chiziq */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ ...flex, position: "absolute", left: 0, right: 0, top: height * 0.36 + i * 18, height: 1, background: "rgba(227,201,143,0.16)" }} />
        ))}
        {/* ikki qatlamli oltin ramka */}
        <div style={{ ...flex, position: "absolute", left: 34, top: 34, right: 34, bottom: 34, border: "2px solid #c9a96a", borderRadius: 28 }} />
        <div style={{ ...flex, position: "absolute", left: 52, top: 52, right: 52, bottom: 52, border: "1px solid rgba(201,169,106,0.45)", borderRadius: 20 }} />
        {[
          { left: 26, top: 26 },
          { right: 26, top: 26 },
          { left: 26, bottom: 26 },
          { right: 26, bottom: 26 },
        ].map((pos, i) => (
          <div key={i} style={{ ...flex, position: "absolute", ...pos, width: 16, height: 16, background: GOLD, transform: "rotate(45deg)" }} />
        ))}

        <div style={{ ...flex, position: "absolute", left: 0, top: 0, width, height, flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: story ? "150px 100px 130px" : "92px 96px 78px" }}>
          {/* tepa: wordmark */}
          <div style={{ ...flex, flexDirection: "column", alignItems: "center" }}>
            <div style={{ ...flex, fontSize: 42, fontWeight: 700, letterSpacing: 16, color: GOLD }}>TALENT.UZ</div>
            <div style={{ ...flex, marginTop: 10, fontSize: 19, fontWeight: 500, letterSpacing: 9, color: "rgba(255,255,255,0.55)" }}>ORCHESTRA &amp; CHOIR</div>
            <div style={{ ...flex, alignItems: "center", marginTop: 16 }}>
              <div style={{ ...flex, width: 120, height: 1, background: "rgba(227,201,143,0.6)" }} />
              <div style={{ ...flex, width: 10, height: 10, margin: "0 14px", background: GOLD, transform: "rotate(45deg)" }} />
              <div style={{ ...flex, width: 120, height: 1, background: "rgba(227,201,143,0.6)" }} />
            </div>
          </div>

          {/* medalyon */}
          <div style={{ ...flex, position: "relative", width: medal, height: medal, alignItems: "center", justifyContent: "center", borderRadius: medal, background: GOLD_GRADIENT, padding: 12, boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}>
            <div style={{ ...flex, width: "100%", height: "100%", borderRadius: medal, background: NAVY, padding: 10 }}>
              <div style={{ ...flex, width: "100%", height: "100%", borderRadius: medal, overflow: "hidden", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 35% 30%, #2d4d7a 0%, #16294a 70%)" }}>
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" width={medal} height={medal} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ ...flex, fontSize: medal * 0.4, fontWeight: 700, color: GOLD, letterSpacing: 4 }}>{initialsOf(talent.fullName)}</div>
                )}
              </div>
            </div>
            <div style={{ ...flex, position: "absolute", right: -6, bottom: 8, width: 92, height: 92, borderRadius: 92, alignItems: "center", justifyContent: "center", background: GOLD_GRADIENT, border: `6px solid ${NAVY}` }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
          </div>

          {/* ism va tur */}
          <div style={{ ...flex, flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ ...flex, padding: "13px 44px", borderRadius: 999, background: GOLD_GRADIENT, fontSize: 25, fontWeight: 700, letterSpacing: 8, color: NAVY }}>TASDIQLANGAN IJODKOR</div>
            <div style={{ ...flex, marginTop: 30, maxWidth: 880, justifyContent: "center", fontSize: nameSize, fontWeight: 700, lineHeight: 1.08, color: "#fff7e6" }}>{talent.fullName}</div>
            <div style={{ ...flex, marginTop: 18, fontSize: 30, fontWeight: 500, letterSpacing: 11, color: GOLD }}>{KIND_LABEL[talent.kind]}</div>
            {talent.city ? <div style={{ ...flex, marginTop: 8, fontSize: 27, fontWeight: 500, color: "rgba(255,255,255,0.62)" }}>{talent.city}</div> : null}
          </div>

          {/* past: nishon raqami, sana */}
          <div style={{ ...flex, width: "100%", flexDirection: "column", alignItems: "center", borderTop: "1px solid rgba(227,201,143,0.4)", paddingTop: 22 }}>
            <div style={{ ...flex, width: "100%", justifyContent: "space-between", fontSize: 23, fontWeight: 500, letterSpacing: 3, color: "rgba(255,255,255,0.8)" }}>
              <div style={flex}>{badgeCode(talent.id)}</div>
              <div style={flex}>{issued}</div>
            </div>
            <div style={{ ...flex, marginTop: 14, fontSize: 20, fontWeight: 500, letterSpacing: 4, color: "rgba(227,201,143,0.85)" }}>OneID ORQALI TASDIQLANGAN</div>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: [
        { name: "Playfair", data: medium, weight: 500, style: "normal" },
        { name: "Playfair", data: bold, weight: 700, style: "normal" },
      ],
    },
  );

  const headers = new Headers(image.headers);
  headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
  if (download) headers.set("Content-Disposition", `attachment; filename="talent-uz-${slug}${story ? "-story" : ""}.png"`);
  return new Response(image.body, { status: 200, headers });
}
