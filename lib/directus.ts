/**
 * Content fetch layer. Every page reads content through these functions.
 *
 * With DIRECTUS_URL and DIRECTUS_BUILD_TOKEN set, everything comes from Directus, cached and
 * tagged per collection so /api/revalidate can refresh it. If Directus is unreachable the
 * committed content-snapshot/ is used instead, so a build during an outage reproduces the last
 * content. In draft mode (/api/preview) the preview token is used, uncached, drafts included.
 * Per ARCHITECTURE.md the layer throws on empty data rather than returning [], so a bad build
 * fails instead of deploying an empty site.
 */
import 'server-only';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { cookies, draftMode } from 'next/headers';
import { cache } from 'react';
import offersJson from '@/content-snapshot/offers.json';
import siteJson from '@/content-snapshot/site_settings.json';
import villasJson from '@/content-snapshot/villas.json';
import { mapOffer, mapPage, mapSiteSettings, mapVilla, type Row } from './cms/map';
import { queries } from './cms/queries';
import { languageCodes, type Locale } from './i18n';
import { pageKeys } from './routes';
import type { Offer, OfferT, Page, SiteSettings, SiteSettingsT, Villa, VillaT } from './types';

export const TAGS = { site: 'site_settings', villas: 'villas', offers: 'offers', pages: 'pages' } as const;

const DIRECTUS_URL = process.env.DIRECTUS_URL?.replace(/\/$/, '');
const BUILD_TOKEN = process.env.DIRECTUS_BUILD_TOKEN;
const PREVIEW_TOKEN = process.env.DIRECTUS_PREVIEW_TOKEN;
export const PREVIEW_VERSION_COOKIE = 'cms_version';

// ---------- snapshot (fallback) ----------------------------------------------------------------

const PAGES_DIR = path.join(process.cwd(), 'content-snapshot/pages');
const snapshot = {
  // JSON imports are typed from their content; the snapshot is whatever the last pull wrote.
  site: () => siteJson as unknown as SiteSettings,
  villas: () => villasJson as unknown as Villa[],
  offers: () => offersJson as unknown as Offer[],
  page: (key: string) => {
    const file = path.join(PAGES_DIR, `${key}.json`);
    return readdirSync(PAGES_DIR).includes(`${key}.json`) ? (JSON.parse(readFileSync(file, 'utf8')) as Page) : null;
  },
};

// ---------- Directus ---------------------------------------------------------------------------

function nonEmpty<T>(data: T | null | undefined, what: string): T {
  if (data == null || (Array.isArray(data) && data.length === 0)) {
    throw new Error(`Content returned empty data for ${what}`);
  }
  return data;
}

/**
 * Draft mode, or false outside a request (generateStaticParams, sitemap at build).
 * `version` is the content version being previewed, as "<collection>:<version key>".
 */
async function preview(): Promise<{ draft: boolean; version: string | null }> {
  try {
    if (!(await draftMode()).isEnabled) return { draft: false, version: null };
    const version = (await cookies()).get(PREVIEW_VERSION_COOKIE)?.value ?? null;
    return { draft: true, version };
  } catch {
    return { draft: false, version: null };
  }
}

/** The previewed version key, if it belongs to this collection. */
async function versionFor(collection: string): Promise<string | null> {
  const { version } = await preview();
  const [c, key] = version?.split(':') ?? [];
  return c === collection && key ? key : null;
}

/** After a failure, skip Directus for a minute so a build doesn't wait out the timeout on every page. */
let directusDownUntil = 0;

async function directus<T>(pathAndQuery: string, tag: string, version: string | null = null): Promise<T> {
  const { draft } = await preview();
  const url = new URL(DIRECTUS_URL + pathAndQuery);
  if (draft && version) url.searchParams.set('version', version);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${draft ? PREVIEW_TOKEN : BUILD_TOKEN}` },
    signal: AbortSignal.timeout(10_000),
    ...(draft ? { cache: 'no-store' as const } : { cache: 'force-cache' as const, next: { tags: [tag] } }),
  });
  if (!res.ok) throw new Error(`Directus ${res.status} for ${url.pathname}`);
  const { data } = (await res.json()) as { data?: T };
  return nonEmpty(data, `${url.pathname} (Directus)`);
}

/** Directus first, snapshot on failure. Without Directus configured, the snapshot only. */
async function load<T>(what: string, fromDirectus: () => Promise<T>, fromSnapshot: () => T): Promise<T> {
  if (DIRECTUS_URL && BUILD_TOKEN && Date.now() >= directusDownUntil) {
    try {
      return await fromDirectus();
    } catch (e) {
      if ((await preview()).draft) throw e; // a broken preview should say so
      directusDownUntil = Date.now() + 60_000;
      console.warn(`[content] Directus unavailable for ${what}, using content-snapshot: ${(e as Error).message}`);
    }
  }
  return fromSnapshot();
}

const loadSite = cache(() =>
  load('site_settings', async () => mapSiteSettings(await directus<Row>(queries.site(), TAGS.site)), snapshot.site),
);

/** The default share image's id, used where an item has no image of its own. */
const fallbackImage = async () => (await loadSite()).og_image;

const loadVillas = cache(async () => {
  const { draft } = await preview();
  return load(
    'villas',
    async () => {
      const rows = await directus<Row[]>(queries.villas(draft), TAGS.villas);
      const fb = await fallbackImage();
      return rows.map((r) => mapVilla(r, fb));
    },
    snapshot.villas,
  );
});

const loadOffers = cache(async () => {
  const { draft } = await preview();
  return load(
    'offers',
    async () => {
      const rows = await directus<Row[]>(queries.offers(draft), TAGS.offers);
      const fb = await fallbackImage();
      return rows.map((r) => mapOffer(r, fb));
    },
    snapshot.offers,
  );
});

const loadPage = cache((key: string) =>
  load(
    `page ${key}`,
    async () => {
      const collection = `page_${key}`;
      const version = await versionFor(collection);
      if (!version) return mapPage(key, await directus<Row>(queries.page(key), TAGS.pages));
      // Content versions only apply on the by-id route.
      const { id } = await directus<Row>(`/items/${collection}?fields=id`, TAGS.pages);
      return mapPage(key, await directus<Row>(`/items/${collection}/${id}?fields=*.*`, TAGS.pages, version));
    },
    () => nonEmpty(snapshot.page(key), `page ${key}`),
  ),
);

// ---------- public API -------------------------------------------------------------------------

/** The translation for `lang`. A missing translation is an error, never a silent fallback to English. */
export function tr<T>(item: { translations: (T & { languages_code: string })[] }, lang: Locale, what: string): T {
  return nonEmpty(item.translations.find((t) => t.languages_code === languageCodes[lang]), `${what} (${lang})`);
}

/** Published and past its publish_at moment; in draft mode everything shows. */
async function isLive(o: { status: string; publish_at?: string | null }) {
  if ((await preview()).draft) return o.status !== 'archived';
  return o.status === 'published' && (!o.publish_at || new Date(o.publish_at) <= new Date());
}

export async function isPreview(): Promise<boolean> {
  return (await preview()).draft;
}

export async function getSiteSettings(lang: Locale): Promise<SiteSettings & { t: SiteSettingsT }> {
  const site = await loadSite();
  return { ...site, t: tr(site, lang, 'site_settings') };
}

/** Whether a fixed page exists in the content source. */
export async function hasPage(key: string): Promise<boolean> {
  try {
    await loadPage(key);
    return true;
  } catch {
    return false;
  }
}

export async function getPage<I, S>(key: string, lang: Locale) {
  const page = (await loadPage(key)) as Page<I, S>;
  return { ...page, t: tr(page, lang, `page ${key}`) };
}

export type LocalizedVilla = Villa & { t: VillaT };
export type LocalizedOffer = Offer & { t: OfferT };

async function liveOnly<T extends { status: string; publish_at?: string | null }>(items: T[]): Promise<T[]> {
  const flags = await Promise.all(items.map(isLive));
  return items.filter((_, i) => flags[i]);
}

export async function getVillas(lang: Locale): Promise<LocalizedVilla[]> {
  return nonEmpty(await liveOnly(await loadVillas()), 'villas')
    .sort((a, b) => a.sort - b.sort)
    .map((v) => ({ ...v, t: tr(v, lang, `villa ${v.id}`) }));
}

export async function getVilla(lang: Locale, slug: string): Promise<LocalizedVilla | undefined> {
  return (await getVillas(lang)).find((v) => v.t.slug === slug);
}

export async function getOffers(lang: Locale): Promise<LocalizedOffer[]> {
  return nonEmpty(await liveOnly(await loadOffers()), 'offers')
    .sort((a, b) => a.sort - b.sort)
    .map((o) => ({ ...o, t: tr(o, lang, `offer ${o.id}`) }));
}

export async function getOffer(lang: Locale, slug: string): Promise<LocalizedOffer | undefined> {
  return (await getOffers(lang)).find((o) => o.t.slug === slug);
}

/** Slug of a villa or offer in every language, for hreflang and the language switcher. */
export function slugsFor(item: { translations: { languages_code: string; slug: string }[] }): Record<Locale, string> {
  return Object.fromEntries(
    (Object.keys(languageCodes) as Locale[]).map((l) => [l, tr(item, l, 'slug').slug]),
  ) as Record<Locale, string>;
}

/** For /api/preview: the path of an item, by collection and key, in `lang`. Uses the preview token. */
export async function previewPath(collection: string, key: string, lang: Locale): Promise<{ pageKey: string; slug?: string } | null> {
  if (collection === 'page') return pageKeys.includes(key as never) ? { pageKey: key } : null;
  const type = collection === 'offers' ? 'offers' : collection === 'villas' ? 'villas' : null;
  if (!type || !DIRECTUS_URL || !PREVIEW_TOKEN) return null;
  const filter = encodeURIComponent(JSON.stringify({ key: { _eq: key } }));
  const res = await fetch(`${DIRECTUS_URL}/items/${type}?fields=translations.slug,translations.languages_code&filter=${filter}&limit=1`, {
    headers: { Authorization: `Bearer ${PREVIEW_TOKEN}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const [row] = ((await res.json()).data ?? []) as { translations: { slug: string; languages_code: string }[] }[];
  const slug = row?.translations.find((t) => t.languages_code === languageCodes[lang])?.slug;
  return slug ? { pageKey: type === 'offers' ? 'offers' : 'stay', slug } : null;
}
