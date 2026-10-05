import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_IMPORT_ROWS, parseCsv, parseMemberRows } from "./members.ts";

test("parseCsv handles BOM, quotes, CRLF and semicolon delimiters", () => {
  assert.deepEqual(parseCsv("﻿F.I.Sh.;Telefon\r\n\"Aliyev, Vali\";90 123 45 67\r\n"), [
    ["F.I.Sh.", "Telefon"],
    ["Aliyev, Vali", "90 123 45 67"],
  ]);
  assert.deepEqual(parseCsv('a,b\n"x ""y""",2'), [["a", "b"], ['x "y"', "2"]]);
  assert.deepEqual(parseCsv(""), []);
});

test("parseMemberRows maps headers in uz, ru and en (Review Focus 4)", () => {
  const uz = parseMemberRows([["F.I.Sh.", "Telefon", "Partiya"], ["Vali Aliyev", "901234567", "Skripka"]]);
  assert.deepEqual(uz.rows, [{ name: "Vali Aliyev", phone: "+998 90 123 45 67", section: "Skripka" }]);
  const ru = parseMemberRows([["ФИО", "Телефон", "Должность"], ["Иван Петров", "+998 91 000 11 22", "Альт"]]);
  assert.equal(ru.rows[0].phone, "+998 91 000 11 22");
  assert.equal(ru.rows[0].section, "Альт");
  const en = parseMemberRows([["Full name", "Phone", "Position"], ["John Doe", "998935556677", "Cello"]]);
  assert.equal(en.rows[0].name, "John Doe");
  assert.equal(en.rows[0].phone, "+998 93 555 66 77");
});

test("columns can be reordered and headerless files use name, phone, section", () => {
  const reordered = parseMemberRows([["Telefon", "F.I.Sh."], ["901112233", "Ali Valiyev"]]);
  assert.deepEqual(reordered.rows[0], { name: "Ali Valiyev", phone: "+998 90 111 22 33", section: "" });
  const headerless = parseMemberRows([["Vali Aliyev", "901234567", "Skripka"]]);
  assert.equal(headerless.rows.length, 1);
  assert.equal(headerless.rows[0].section, "Skripka");
});

test("invalid, duplicate and empty rows are reported with their line numbers", () => {
  const res = parseMemberRows([
    ["F.I.Sh.", "Telefon"],
    ["", ""],
    ["A", "901234567"],
    ["Vali Aliyev", "12345"],
    ["Vali Aliyev", "901234567"],
    ["Sami Karimov", "90 123 45 67"],
    ["Nodir Ergashev", "+998 91 777 88 99"],
  ]);
  assert.equal(res.total, 5);
  assert.deepEqual(res.errors, [
    { line: 3, reason: "name" },
    { line: 4, reason: "phone" },
    { line: 6, reason: "duplicate" },
  ]);
  assert.deepEqual(res.rows.map((r) => r.name), ["Vali Aliyev", "Nodir Ergashev"]);
});

test("more than the maximum number of rows is flagged (Review Focus 4)", () => {
  const rows = [["F.I.Sh.", "Telefon"], ...Array.from({ length: MAX_IMPORT_ROWS + 5 }, (_, i) => [`Ism ${i}`, `9${String(10000000 + i).padStart(8, "0")}`])];
  const res = parseMemberRows(rows);
  assert.equal(res.tooMany, true);
  assert.equal(res.rows.length, MAX_IMPORT_ROWS);
  assert.equal(parseMemberRows([["F.I.Sh.", "Telefon"], ["Vali Aliyev", "901234567"]]).tooMany, false);
});
