import { localPhone, parseContact } from "../auth/contact.ts";

export const MAX_IMPORT_ROWS = 1000;

export type MemberRow = { name: string; phone: string; section: string };
export type ImportError = { line: number; reason: "name" | "phone" | "duplicate" };
export type ParsedMembers = { rows: MemberRow[]; errors: ImportError[]; total: number; tooMany: boolean };

const ALIASES: Record<keyof MemberRow, string[]> = {
  name: ["fish", "fio", "ism", "ismfamiliya", "familiyaism", "fullname", "name", "фио", "имя", "фамилияимя"],
  phone: ["telefon", "telefonraqami", "tel", "phone", "phonenumber", "телефон", "тел"],
  section: ["partiya", "guruh", "lavozim", "section", "position", "role", "cholgu", "instrument", "партия", "группа", "должность", "инструмент"],
};

const normalizeHeader = (s: string): string => s.toLowerCase().replace(/[^a-zа-яё]+/g, "");

/** CSV matnini qatorlarga ajratadi: BOM, qo`shtirnoq, CRLF va `,` `;` `\t` ajratkichlari qo`llab-quvvatlanadi */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  if (!src.trim()) return [];
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [";", "\t", ","].map((d) => ({ d, n: firstLine.split(d).length })).sort((a, b) => b.n - a.n)[0].d;
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** Sarlavhalarni (uz/ru/en) taniydi; sarlavhasiz fayl uchun ustunlar tartibi: ism, telefon, partiya */
export function parseMemberRows(raw: string[][]): ParsedMembers {
  const isEmpty = (r: string[]) => r.every((c) => !c?.trim());
  let columns: Record<keyof MemberRow, number> = { name: 0, phone: 1, section: 2 };
  let start = 0;

  const headerIndex = raw.findIndex((r) => !isEmpty(r));
  if (headerIndex >= 0) {
    const cells = raw[headerIndex].map(normalizeHeader);
    const find = (key: keyof MemberRow) => cells.findIndex((c) => ALIASES[key].includes(c));
    const found = { name: find("name"), phone: find("phone"), section: find("section") };
    if (found.name >= 0 || found.phone >= 0) {
      columns = { name: found.name >= 0 ? found.name : 0, phone: found.phone >= 0 ? found.phone : 1, section: found.section };
      start = headerIndex + 1;
    }
  }

  const rows: MemberRow[] = [];
  const errors: ImportError[] = [];
  const seen = new Set<string>();
  let total = 0;
  let tooMany = false;

  for (let i = start; i < raw.length; i++) {
    const r = raw[i];
    if (isEmpty(r)) continue;
    if (total >= MAX_IMPORT_ROWS) {
      tooMany = true;
      break;
    }
    total++;
    const line = i + 1;
    const name = (r[columns.name] ?? "").trim();
    const phone = parseContact(String(r[columns.phone] ?? ""))?.channel === "phone" ? parseContact(String(r[columns.phone]))!.value : null;
    if (name.length < 2 || name.length > 80) {
      errors.push({ line, reason: "name" });
      continue;
    }
    if (!phone || !localPhone(phone)) {
      errors.push({ line, reason: "phone" });
      continue;
    }
    if (seen.has(phone)) {
      errors.push({ line, reason: "duplicate" });
      continue;
    }
    seen.add(phone);
    rows.push({ name, phone, section: columns.section >= 0 ? (r[columns.section] ?? "").trim().slice(0, 60) : "" });
  }
  return { rows, errors, total, tooMany };
}
