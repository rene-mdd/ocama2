import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import redirectsSnapshot from './content-snapshot/redirects.json' with { type: 'json' };
import { toNextRedirects, type RedirectRow } from './lib/legacy-redirects';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const DIRECTUS_URL = process.env.DIRECTUS_URL?.replace(/\/$/, '');

/** Redirects come from the Directus `redirects` collection at build, the snapshot if it's unreachable. */
async function redirectRows(): Promise<RedirectRow[]> {
  if (DIRECTUS_URL && process.env.DIRECTUS_BUILD_TOKEN) {
    try {
      const res = await fetch(`${DIRECTUS_URL}/items/redirects?fields=from,to&limit=-1`, {
        headers: { Authorization: `Bearer ${process.env.DIRECTUS_BUILD_TOKEN}` },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`Directus ${res.status}`);
      const { data } = (await res.json()) as { data: RedirectRow[] };
      if (data.length) return data;
    } catch (e) {
      console.warn(`[content] Directus unavailable for redirects, using content-snapshot: ${(e as Error).message}`);
    }
  }
  return redirectsSnapshot as RedirectRow[];
}

const nextConfig: NextConfig = {
  // Overridable so parallel local builds don't share one output directory.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // Never set output: 'export' (ARCHITECTURE.md): it breaks draft preview and revalidation.
  // Pages that render on demand (offers published after the build) read the snapshot from disk.
  outputFileTracingIncludes: { '/*': ['./content-snapshot/**/*'] },
  // The old site's URLs end in "/". Next's automatic slash-stripping would run before the legacy
  // redirects and make every old URL two hops, so trailing slashes are handled below instead.
  skipTrailingSlashRedirect: true,
  async headers() {
    // The Directus split view frames the site for preview (ARCHITECTURE.md, Draft preview).
    const frame = ["'self'", DIRECTUS_URL ? new URL(DIRECTUS_URL).origin : null].filter(Boolean).join(' ');
    return [{ source: '/:path*', headers: [{ key: 'Content-Security-Policy', value: `frame-ancestors ${frame}` }] }];
  },
  async redirects() {
    return [
      // Both languages are prefixed; the bare root goes to English. No browser-language redirect.
      { source: '/', destination: '/en', permanent: false },
      // Old ocama.com URLs and renamed slugs, single hop (they match with or without the trailing slash).
      ...toNextRedirects(await redirectRows()),
      // Everything else: strip a trailing slash, as Next would by default.
      { source: '/:path+/', destination: '/:path+', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
