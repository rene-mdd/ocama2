import type { Locale } from './i18n';
import { locales } from './i18n';

/**
 * Route segment map. Page keys are stable identifiers (they match `pages.key` in
 * Directus); the segments are what appears in the URL for each language.
 * Every internal link is built through `href()` so the language switcher and
 * hreflang can always work out the counterpart URL.
 */
export const segments = {
  home: { en: '', es: '' },
  about: { en: 'about', es: 'el-hotel' },
  stay: { en: 'stay', es: 'estadia' },
  dining: { en: 'dining', es: 'gastronomia' },
  wellness: { en: 'wellness', es: 'bienestar' },
  experiences: { en: 'experiences', es: 'experiencias' },
  hospitality: { en: 'hospitality', es: 'hospitalidad' },
  sustainability: { en: 'sustainability', es: 'sostenibilidad' },
  offers: { en: 'offers', es: 'ofertas' },
  plan: { en: 'plan-your-stay', es: 'planifique-su-estadia' },
  press: { en: 'press', es: 'prensa' },
} as const satisfies Record<string, Record<Locale, string>>;

export type PageKey = keyof typeof segments;
export const pageKeys = Object.keys(segments) as PageKey[];

/** Pages that own a second, editor-controlled segment: villas live under stay, offers under offers. */
export type DetailKey = 'stay' | 'offers';

export function href(lang: Locale, key: PageKey, slug?: string, hash?: string): string {
  const parts = [lang, segments[key][lang], slug].filter(Boolean);
  return `/${parts.join('/')}${hash ? `#${hash}` : ''}`;
}

export type Resolved = { key: PageKey; slug?: string };

/** Map URL segments (after the locale) back to a page key and optional detail slug. */
export function resolve(lang: Locale, parts: string[]): Resolved | null {
  if (parts.length === 0) return { key: 'home' };
  if (parts.length > 2) return null;
  const key = pageKeys.find((k) => k !== 'home' && segments[k][lang] === parts[0]);
  if (!key) return null;
  if (parts.length === 2) {
    if (key !== 'stay' && key !== 'offers') return null;
    return { key, slug: parts[1] };
  }
  return { key };
}

/** Counterpart URLs in every language, given the slug of the detail item per language. */
export function alternates(key: PageKey, slugs?: Record<Locale, string>): Record<Locale, string> {
  return Object.fromEntries(locales.map((l) => [l, href(l, key, slugs?.[l])])) as Record<Locale, string>;
}
