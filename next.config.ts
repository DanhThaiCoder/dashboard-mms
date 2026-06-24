/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NODE_ENV === 'production' ? '/dashboard-mms' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/dashboard-mms/' : '',
  images: { unoptimized: true },
  trailingSlash: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
  
  outputFileTracingIncludes: {
    '/api/cron': ['node_modules/@sparticuz/chromium-min/bin/**/*'],
    '/api/test-scrape': ['node_modules/@sparticuz/chromium-min/bin/**/*'],
  },
};

module.exports = nextConfig;