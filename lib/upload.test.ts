import assert from "node:assert/strict";
import { test } from "node:test";
import { parseYoutubeId, UPLOAD_RULES, validateUpload } from "./upload.ts";

const MB = 1024 * 1024;

test("validateUpload accepts allowed formats case-insensitively", () => {
  assert.deepEqual(validateUpload("video", "a.MP4", 1), { ok: true });
  assert.deepEqual(validateUpload("audio", "song.wav", 10 * MB), { ok: true });
  assert.deepEqual(validateUpload("document", "scan.PDF", 20 * MB), { ok: true });
});

test("validateUpload rejects wrong extension, size and name (Review Focus 2)", () => {
  assert.deepEqual(validateUpload("video", "a.exe", 1), { ok: false, reason: "extension" });
  assert.deepEqual(validateUpload("audio", "a.mp4", 1), { ok: false, reason: "extension" });
  assert.deepEqual(validateUpload("audio", "noext", 5), { ok: false, reason: "extension" });
  assert.deepEqual(validateUpload("video", "a.mp4", 500 * MB + 1), { ok: false, reason: "size" });
  assert.deepEqual(validateUpload("audio", "", 5), { ok: false, reason: "name" });
  assert.deepEqual(validateUpload("audio", "a.mp3", 0), { ok: false, reason: "size" });
  assert.equal(UPLOAD_RULES.document.maxBytes, 20 * MB);
});

test("parseYoutubeId accepts only real YouTube links or bare ids", () => {
  const id = "dQw4w9WgXcQ";
  for (const input of [`https://youtu.be/${id}?t=5`, `https://www.youtube.com/watch?v=${id}&x=1`, `https://youtube.com/embed/${id}`, id]) {
    assert.equal(parseYoutubeId(input), id);
  }
  for (const input of ["javascript:alert(1)", "https://youtube.com/x", "", "https://evil.com/watch?v=dQw4w9WgXcQ", "<script>"]) {
    assert.equal(parseYoutubeId(input), null);
  }
});
