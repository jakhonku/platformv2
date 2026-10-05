/** Xatga biriktiriladigan PDF qoidalari (klient va server uchun umumiy) */
export const MAX_PDF_BYTES = 3 * 1024 * 1024;
export const MAX_PDF_FILES = 3;
const PDF_DATA_URL = /^data:application\/pdf;base64,[A-Za-z0-9+/=]+$/;

export type PdfUpload = { name: string; size: number; dataUrl: string };

export const isPdfName = (name: string): boolean => /\.pdf$/i.test(name.trim());
export const isPdfDataUrl = (value: string): boolean => PDF_DATA_URL.test(value);

export function validatePdf(file: { name: string; size: number }): "ok" | "type" | "size" {
  if (!isPdfName(file.name)) return "type";
  if (file.size <= 0 || file.size > MAX_PDF_BYTES) return "size";
  return "ok";
}

export function formatFileSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
