import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPhoneInput, parseContact, sanitizeOtp } from "./contact.ts";

test("parseContact normalizes phones", () => {
  for (const input of ["90 123 45 67", "+998901234567", "998 90 123-45-67", "901234567"]) {
    assert.deepEqual(parseContact(input), { channel: "phone", value: "+998 90 123 45 67" });
  }
});

test("parseContact normalizes emails", () => {
  assert.deepEqual(parseContact(" A@B.uz "), { channel: "email", value: "a@b.uz" });
});

test("parseContact rejects garbage (Review Focus 2)", () => {
  for (const input of ["", "12345", "a@b", "<script>", "+1 202 555 0100", "9012345678"]) assert.equal(parseContact(input), null);
});

test("formatPhoneInput formats progressively", () => {
  assert.equal(formatPhoneInput("9012"), "+998 90 12");
  assert.equal(formatPhoneInput("901234567999"), "+998 90 123 45 67");
  assert.equal(formatPhoneInput("+998 90 1"), "+998 90 1");
  assert.equal(formatPhoneInput("abc"), "");
  assert.equal(formatPhoneInput(""), "");
});

test("sanitizeOtp keeps up to six digits (Review Focus 1)", () => {
  assert.equal(sanitizeOtp(" 12-34 56 78"), "123456");
  assert.equal(sanitizeOtp("12ab3"), "123");
  assert.equal(sanitizeOtp(""), "");
});
