/**
 * Redirect rules. The data lives in the Directus `redirects` collection (seeded with the old
 * ocama.com URLs, extended automatically when an offer or villa slug changes); the committed
 * fallback is content-snapshot/redirects.json, built from legacyRedirectList() below.
 */
import offersSnapshot from '../content-snapshot/offers.json' with { type: 'json' };
import villasSnapshot from '../content-snapshot/villas.json' with { type: 'json' };
import { href, type PageKey } from './routes';

export type RedirectRow = { from: string; to: string; note?: string | null };
type NextRedirect = { source: string; destination: string; permanent: true };

/** Old WordPress promotion post id → offer id (from the old posts' titles). */
const PROMOTIONS: Record<string, string> = {
  '289': 'extend',
  '294': 'taste',
  '296': 'discovery',
  '298': 'romance',
  '300': 'longer',
  '302': 'dominican',
};

const PAGES: [string[], PageKey][] = [
  [['/about'], 'about'],
  [['/villas', '/gallery'], 'stay'],
  [['/experiences/dining', '/dining', '/menu'], 'dining'],
  [['/experiences/wellness', '/wellness'], 'wellness'],
  [['/experiences/activities', '/activities', '/experiences/las-galeras', '/experiences'], 'experiences'],
  [['/experiences/5-stars-services', '/5-stars-services'], 'hospitality'],
  [['/contact', '/villas/information'], 'plan'],
  [['/promotions', '/promotions/promo-1'], 'offers'],
  [['/coming-soon.html', '/maintenance', '/index.html'], 'home'],
];

/**
 * The previous ocama.com (../ocama) → new routes, including the canonical URLs the old site
 * declared (e.g. /casa-ana/, /dining/), which differ from its real paths.
 */
export function legacyRedirectList(): RedirectRow[] {
  const note = 'Previous ocama.com';
  const offers = offersSnapshot as unknown as { id: string; translations: { languages_code: string; slug: string }[] }[];
  const offerSlug = (id: string) => {
    const o = offers.find((x) => x.id === id);
    if (!o) throw new Error(`legacy redirect: unknown offer ${id}`);
    return o.translations.find((t) => t.languages_code === 'en-US')!.slug;
  };
  return [
    ...PAGES.flatMap(([paths, key]) => paths.map((from) => ({ from, to: href('en', key), note }))),
    ...(villasSnapshot as unknown as { id: string }[]).flatMap((v) => {
      const slug = `casa-${v.id}`;
      return [`/villas/${slug}`, `/${slug}`].map((from) => ({ from, to: href('en', 'stay', slug), note }));
    }),
    ...Object.entries(PROMOTIONS).map(([post, offer]) => ({
      from: `/promotions/promo-${post}`,
      to: href('en', 'offers', offerSlug(offer)),
      note,
    })),
  ];
}

/**
 * Rows → Next.js redirects. Chains are collapsed (a→b, b→c becomes a→c, then b→c), each
 * `from` also matches a trailing slash and /index.html, as the old static host served all three.
 */
export function toNextRedirects(rows: RedirectRow[]): NextRedirect[] {
  const map = new Map(rows.map((r) => [r.from.replace(/\/$/, '') || '/', r.to]));
  const resolve = (to: string) => {
    const seen = new Set<string>();
    while (map.has(to) && !seen.has(to)) {
      seen.add(to);
      to = map.get(to)!;
    }
    return to;
  };
  return [...map.entries()].flatMap(([from, to]) => {
    const destination = resolve(to);
    if (destination === from) return [];
    const sources = from.endsWith('.html') ? [from] : [`${from}{/}?`, `${from}/index.html`];
    return sources.map((source) => ({ source, destination, permanent: true as const }));
  });
}
