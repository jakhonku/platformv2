import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Xatga PDF biriktirish (base64) uchun Server Action so'rov hajmi
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
  // Nishon PNG (next/og) shriftlari serverless funksiyaga qo'shilsin
  outputFileTracingIncludes: { "/api/badge/[slug]": ["./assets/fonts/**"] },
};

export default withNextIntl(nextConfig);
