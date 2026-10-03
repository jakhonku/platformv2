// Loyiha qoidalari tekshiruvi: dark rejim yoʻq, mock faqat lib/data da, messages pariteti
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const scanDirs = ["app", "components", "lib", "types", "i18n"];
const errors = [];

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = scanDirs.flatMap((d) => walk(join(root, d))).filter((f) => /\.(tsx?|css|mjs)$/.test(f));

for (const f of files) {
  const rel = relative(root, f).split(sep).join("/");
  const src = readFileSync(f, "utf8");
  if (/(^|[\s"'`:])dark:/m.test(src)) errors.push(`${rel}: "dark:" prefiksi`);
  if (/\.dark\b|@custom-variant\s+dark/.test(src)) errors.push(`${rel}: ".dark" / custom-variant dark`);
  if (/next-themes/.test(src)) errors.push(`${rel}: next-themes`);
  if (/from\s+["'][^"']*lib\/mock/.test(src) && !rel.startsWith("lib/data/"))
    errors.push(`${rel}: lib/mock faqat lib/data ichida import qilinadi`);
}

const langs = ["uz", "ru", "en"];
const msgFiles = langs.map((l) => join(root, "messages", `${l}.json`));
if (msgFiles.every(existsSync)) {
  const flat = (o, p = "") =>
    Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? flat(v, `${p}${k}.`) : [`${p}${k}`]));
  const keys = msgFiles.map((f) => new Set(flat(JSON.parse(readFileSync(f, "utf8")))));
  const all = new Set(keys.flatMap((s) => [...s]));
  keys.forEach((s, i) => {
    for (const k of all) if (!s.has(k)) errors.push(`messages/${langs[i]}.json: "${k}" kaliti yoʻq`);
  });
}

if (errors.length) {
  console.error("check: XATO\n - " + errors.join("\n - "));
  process.exit(1);
}
console.log("check: OK");
