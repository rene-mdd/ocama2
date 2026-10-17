/**
 * Content fetch layer. Every page reads content through these functions.
 *
 * Today the only source is the committed content-snapshot/ (Directus is not stood up yet).
 * When it is, each getter tries Directus with DIRECTUS_BUILD_TOKEN first and falls back to
 * the snapshot, keeping the same signatures, so no page changes. Per ARCHITECTURE.md the
 * layer throws on empty data rather than returning [], so a bad build fails instead of
 * deploying an empty site.
 */
import 'server-only';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import offersJson from '@/content-snapshot/offers.json';
import siteJson from '@/content-snapshot/site_settings.json';
import villasJson from '@/content-snapshot/villas.json';
import { languageCodes, type Locale } from './i18n';
import type { Offer, OfferT, Page, SiteSettings, SiteSettingsT, Villa, VillaT } from './types';

const site = siteJson as SiteSettings;
const villas = villasJson as Villa[];
const offers = offersJson as Offer[];
// One file per fixed page, read at build time (every page is prerendered).
const PAGES_DIR = path.join(process.cwd(), 'content-snapshot/pages');
const pages: Page[] = readdirSync(PAGES_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(path.join(PAGES_DIR, f), 'utf8')));

function nonEmpty<T>(data: T | null | undefined, what: string): T {
  if (data == null || (Array.isArray(data) && data.length === 0)) {
    throw new Error(`Content returned empty data for ${what}`);
  }
  return data;
}

/** The translation for `lang`. A missing translation is an error, never a silent fallback to English. */
export function tr<T>(item: { translations: (T & { languages_code: string })[] }, lang: Locale, what: string): T {
  return nonEmpty(item.translations.find((t) => t.languages_code === languageCodes[lang]), `${what} (${lang})`);
}

/** Published and past its publish_at moment (ARCHITECTURE.md, scheduled publishing). */
function isLive(o: { status: string; publish_at?: string | null }) {
  return o.status === 'published' && (!o.publish_at || new Date(o.publish_at) <= new Date());
}

export function getSiteSettings(lang: Locale): SiteSettings & { t: SiteSettingsT } {
  return { ...site, t: tr(site, lang, 'site_settings') };
}

/** Whether a fixed page exists in the content source (pages not yet ported are skipped). */
export function hasPage(key: string): boolean {
  return pages.some((p) => p.key === key && isLive(p));
}

export function getPage<I, S>(key: string, lang: Locale) {
  const page = nonEmpty(pages.find((p) => p.key === key && isLive(p)), `page ${key}`) as Page<I, S>;
  return { ...page, t: tr(page, lang, `page ${key}`) };
}

export type LocalizedVilla = Villa & { t: VillaT };
export type LocalizedOffer = Offer & { t: OfferT };

export function getVillas(lang: Locale): LocalizedVilla[] {
  return nonEmpty(villas.filter(isLive), 'villas')
    .sort((a, b) => a.sort - b.sort)
    .map((v) => ({ ...v, t: tr(v, lang, `villa ${v.id}`) }));
}

export function getVilla(lang: Locale, slug: string): LocalizedVilla | undefined {
  return getVillas(lang).find((v) => v.t.slug === slug);
}

export function getOffers(lang: Locale): LocalizedOffer[] {
  return nonEmpty(offers.filter(isLive), 'offers')
    .sort((a, b) => a.sort - b.sort)
    .map((o) => ({ ...o, t: tr(o, lang, `offer ${o.id}`) }));
}

export function getOffer(lang: Locale, slug: string): LocalizedOffer | undefined {
  return getOffers(lang).find((o) => o.t.slug === slug);
}

/** Slug of a villa or offer in every language, for hreflang and the language switcher. */
export function slugsFor(item: { translations: { languages_code: string; slug: string }[] }): Record<Locale, string> {
  return Object.fromEntries(
    (Object.keys(languageCodes) as Locale[]).map((l) => [l, tr(item, l, 'slug').slug]),
  ) as Record<Locale, string>;
}
