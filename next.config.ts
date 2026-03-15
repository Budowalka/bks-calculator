import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/calculate-quote': ['./node_modules/@sparticuz/chromium/**'],
    '/api/generate-preview-pdf': ['./node_modules/@sparticuz/chromium/**'],
  },
};

export default nextConfig;
