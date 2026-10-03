import assert from "node:assert/strict";
import { test } from "node:test";
import type { MediaItem } from "../types/media.ts";
import { formatDuration, groupMedia, youtubeEmbedUrl, youtubeThumbUrl } from "./media.ts";

const item = (id: string, type: MediaItem["type"]): MediaItem => ({
  id,
  ownerId: "o",
  ownerType: "talent",
  type,
  title: id,
  description: "",
  url: "",
  moderation: "approved",
  views: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
});

test("youtubeEmbedUrl builds a nocookie autoplay URL for a valid id", () => {
  assert.equal(youtubeEmbedUrl("dQw4w9WgXcQ"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0");
});

test("youtubeEmbedUrl and youtubeThumbUrl reject unsafe ids (Review Focus 5)", () => {
  for (const bad of ["../x", "a b", "", "<script>", "ab", "x".repeat(30)]) {
    assert.equal(youtubeEmbedUrl(bad), null, bad);
    assert.equal(youtubeThumbUrl(bad), null, bad);
  }
  assert.equal(youtubeThumbUrl("dQw4w9WgXcQ"), "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
});

test("formatDuration formats m:ss and h:mm:ss", () => {
  assert.equal(formatDuration(65), "1:05");
  assert.equal(formatDuration(3725), "1:02:05");
  assert.equal(formatDuration(0), "0:00");
});

test("formatDuration returns empty string for missing or invalid values", () => {
  assert.equal(formatDuration(undefined), "");
  assert.equal(formatDuration(-3), "");
  assert.equal(formatDuration(Number.NaN), "");
});

test("groupMedia puts document, score and midi into documents and keeps order", () => {
  const g = groupMedia([item("a", "score"), item("b", "video"), item("c", "midi"), item("d", "audio"), item("e", "document")]);
  assert.deepEqual(g.video.map((m) => m.id), ["b"]);
  assert.deepEqual(g.audio.map((m) => m.id), ["d"]);
  assert.deepEqual(g.documents.map((m) => m.id), ["a", "c", "e"]);
});
