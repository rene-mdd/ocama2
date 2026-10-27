/**
 * Shared helpers for the one-off export → content-snapshot extraction.
 * Run with `npm run extract`. The export in ../ocama-2.0-export is the source.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import { href, segments, type PageKey } from '../../lib/routes';
import type { Locale } from '../../lib/i18n';

export const EXPORT_DIR = path.resolve(import.meta.dirname, '../../../ocama-2.0-export');

export type $ = cheerio.CheerioAPI;
export type Sel = cheerio.Cheerio<AnyNode>;

export function load(lang: Locale, file: string): $ {
  return cheerio.load(readFileSync(path.join(EXPORT_DIR, lang, file), 'utf8'), {}, true);
}

/** Strip accents and build a URL slug (architecture: slugifier strips, never percent-encodes). */
export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Offer file id (offer-taste.html → taste) to slug per language, filled by the offers extractor. */
export const offerSlugs: Record<Locale, Record<string, string>> = { en: {}, es: {} };

/** Rewrite an export link (`plan.html`, `villa-bagua.html`, `stay.html#compare`) to the Next.js route. */
export function mapHref(raw: string, lang: Locale): string {
  if (/^(https?:|mailto:|tel:|#)/.test(raw)) return raw;
  const m = raw.match(/^([a-z-]+)\.html(?:#(.+))?$/);
  if (!m) throw new Error(`Unmapped link: ${raw}`);
  const [, file, hash] = m;
  if (file === 'index') return href(lang, 'home', undefined, hash);
  if (file.startsWith('villa-')) return href(lang, 'stay', `casa-${file.slice(6)}`, hash);
  if (file.startsWith('offer-')) {
    const slug = offerSlugs[lang][file.slice(6)];
    if (!slug) throw new Error(`Unknown offer link: ${raw}`);
    return href(lang, 'offers', slug, hash);
  }
  if (!(file in segments)) throw new Error(`Unknown page link: ${raw}`);
  return href(lang, file as PageKey, undefined, hash);
}

const squash = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Plain text of an element, whitespace normalised. */
export function text(el: Sel): string {
  if (el.length !== 1) throw new Error(`text(): expected 1 element, got ${el.length}`);
  return squash(el.text());
}

/**
 * Inline rich text (the limited WYSIWYG subset: em, strong, a, br) as an HTML string.
 * Links are rewritten to Next.js routes; anything else is rejected so nothing styled slips in.
 */
export function rich(el: Sel, lang: Locale): string {
  if (el.length !== 1) throw new Error(`rich(): expected 1 element, got ${el.length}`);
  const c = el.clone();
  c.find('*').each((_, node) => {
    const n = c.find(node as Element);
    const tag = (node as Element).tagName;
    if (!['em', 'strong', 'b', 'i', 'a', 'br'].includes(tag)) {
      throw new Error(`rich(): unsupported <${tag}> in ${squash(el.text()).slice(0, 60)}`);
    }
    const attrs = { ...(node as Element).attribs };
    for (const a of Object.keys(attrs)) n.removeAttr(a);
    if (tag === 'a') n.attr('href', mapHref(attrs.href, lang));
  });
  return squash(c.html() ?? '');
}

/** Attribute that must exist. */
export function attr(el: Sel, name: string): string {
  const v = el.attr(name);
  if (v === undefined) throw new Error(`Missing ${name} on <${el.prop('tagName')}>`);
  return v;
}

/** The fallback URL from an `onerror="this.onerror=null;this.src='…'"` handler, if any. */
export function fallbackSrc(el: Sel): string | null {
  const m = (el.attr('onerror') ?? '').match(/this\.src='([^']+)'/);
  return m ? m[1] : null;
}

/** A labelled link: label text plus mapped href. */
export function link(el: Sel, lang: Locale) {
  return { label: text(el), href: mapHref(attr(el, 'href'), lang) };
}

export function assertEqual<T>(a: T, b: T, what: string) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(`${what} differs:\n${JSON.stringify(a)}\n${JSON.stringify(b)}`);
  }
}

export function each<T>(sel: Sel, fn: (el: Sel, i: number) => T): T[] {
  return sel.toArray().map((node, i) => fn(sel.eq(i), i));
}

/** The standard sub-page hero (see components/sections/PageHero.tsx). */
export function heroOf($: $, lang: Locale) {
  const hero = $('main > section.phero');
  const img = hero.children('img');
  const sub = hero.find('.inner > p.sub');
  const mi = $('main > section.m-intro');
  if (mi.length !== (sub.hasClass('sub-long') ? 1 : 0)) throw new Error('hero: m-intro / sub-long mismatch');
  return {
    image: attr(img, 'src'),
    hero: {
      eyebrow: text(hero.find('.inner > p.eyebrow')),
      title: rich(hero.find('h1'), lang),
      subtitle: rich(sub, lang),
      alt: attr(img, 'alt'),
      mobile_intro: mi.length ? text(mi.find('p')) : null,
    },
  };
}

/** SEO fields start empty; scripts/extract/legacy-seo.ts fills them from the old site. */
export const SEO_NULL = { meta_title: null, meta_description: null, og_title: null, og_description: null, og_image_alt: null };
