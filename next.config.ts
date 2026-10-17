import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Overridable so parallel local builds don't share one output directory.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // Never set output: 'export' (ARCHITECTURE.md): it breaks draft preview and revalidation.
  async redirects() {
    // Both languages are prefixed; the bare root goes to English. No browser-language redirect.
    return [{ source: '/', destination: '/en', permanent: false }];
  },
};

export default withNextIntl(nextConfig);
