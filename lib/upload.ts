export type UploadKind = "video" | "audio" | "document";

const MB = 1024 * 1024;

/** Masterprompt 9.3: video MP4/MOV, audio MP3/WAV, hujjat PDF/JPG/PNG */
export const UPLOAD_RULES: Record<UploadKind, { extensions: string[]; maxBytes: number }> = {
  video: { extensions: ["mp4", "mov"], maxBytes: 500 * MB },
  audio: { extensions: ["mp3", "wav"], maxBytes: 50 * MB },
  document: { extensions: ["pdf", "jpg", "jpeg", "png"], maxBytes: 20 * MB },
};

export type UploadCheck = { ok: true } | { ok: false; reason: "extension" | "size" | "name" };

const extensionOf = (fileName: string): string => {
  const dot = fileName.lastIndexOf(".");
  return dot < 0 ? "" : fileName.slice(dot + 1).toLowerCase();
};

export function validateUpload(kind: UploadKind, fileName: string, sizeBytes: number): UploadCheck {
  if (!fileName.trim()) return { ok: false, reason: "name" };
  const rule = UPLOAD_RULES[kind];
  if (!rule.extensions.includes(extensionOf(fileName))) return { ok: false, reason: "extension" };
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > rule.maxBytes) return { ok: false, reason: "size" };
  return { ok: true };
}

const ID = /^[A-Za-z0-9_-]{6,20}$/;

/** youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID yoki yalang ID; boshqa hamma narsa null */
export function parseYoutubeId(input: string): string | null {
  const v = input.trim();
  if (ID.test(v)) return v;
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0] ?? null;
  else if (host === "youtube.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (url.pathname.startsWith("/embed/")) id = url.pathname.slice(7).split("/")[0] ?? null;
  }
  return id && ID.test(id) ? id : null;
}
