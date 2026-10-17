/**
 * Parity check: the built site against the approved export, page by page, both languages.
 *   npm run build && npm run parity [-- <file-filter>]
 * Compares, in document order, the visible text and an element signature (tag, classes with
 * inline styles mapped to their utility classes, mapped link targets, image sources and alt text)
 * for <main>, the header nav, mobile menu and footer.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import offers from '../content-snapshot/offers.json' with { type: 'json' };
import { classesFor } from './utilities';
import { EXPORT_DIR, mapHref, offerSlugs } from './extract/lib';
import { href, segments, type PageKey } from '../lib/routes';
import type { Locale } from '../lib/i18n';

const BUILD = path.resolve(import.meta.dirname, '..', process.env.NEXT_DIST_DIR ?? '.next', 'server/app');
const filter = process.argv[2];

for (const o of offers) {
  for (const t of o.translations) offerSlugs[t.languages_code === 'en-US' ? 'en' : 'es'][o.id] = t.slug;
}

function routeFor(lang: Locale, file: string): string {
  const id = file.replace('.html', '');
  if (id === 'index') return href(lang, 'home');
  if (id.startsWith('villa-')) return href(lang, 'stay', `casa-${id.slice(6)}`);
  if (id.startsWith('offer-')) return href(lang, 'offers', offerSlugs[lang][id.slice(6)]);
  if (!(id in segments)) throw new Error(`no route for ${file}`);
  return href(lang, id as PageKey);
}

// Classes that only exist on one side by design.
const IGNORE_CLASS = new Set(['active', 'scrolled']);

function signature($: cheerio.CheerioAPI, root: cheerio.Cheerio<AnyNode>, side: 'export' | 'built', lang: Locale): string[] {
  const out: string[] = [];
  // Adjacent text nodes are merged: React splits interpolated text with <!-- --> markers.
  let pending: string | null = null;
  const flush = () => {
    const t = pending?.replace(/\s+/g, ' ').trim();
    if (t) out.push(`  "${t}"`);
    pending = null;
  };
  const walk = (node: AnyNode) => {
    if (node.type === 'text') {
      pending = (pending ?? '') + (node as unknown as { data: string }).data;
      return;
    }
    if (node.type === 'comment') return;
    flush();
    if (node.type !== 'tag') return;
    const el = node as Element;
    if (el.tagName === 'script' || el.tagName === 'template') return;
    const a = el.attribs;
    const classes = [...(a.class ?? '').split(/\s+/), ...(side === 'export' && a.style ? classesFor(a.style).split(' ') : [])]
      .filter((c) => c && !IGNORE_CLASS.has(c))
      .sort();
    let sig = `<${el.tagName}${classes.length ? '.' + classes.join('.') : ''}`;
    if (a.id) sig += `#${a.id}`;
    if (el.tagName === 'a' && a.href) sig += ` href=${side === 'export' ? mapHref(a.href, lang) : a.href}`;
    // The founder photo moved from the export's relative img/ folder to public/static/.
    const src = side === 'export' ? a.src?.replace(/^img\//, '/static/') : a.src;
    if (el.tagName === 'img') sig += ` src=${src} alt=${a.alt}`;
    if (el.tagName === 'source') sig += ` src=${a.src}`;
    out.push(sig + '>');
    el.children.forEach(walk);
  };
  root.toArray().forEach(walk);
  flush();
  return out;
}

function compare(lang: Locale, file: string): string[] {
  const route = routeFor(lang, file);
  const builtFile = path.join(BUILD, `${route.slice(1)}.html`);
  if (!existsSync(builtFile)) return [`missing build output ${route}`];
  const ex = cheerio.load(readFileSync(path.join(EXPORT_DIR, lang, file), 'utf8'));
  const bu = cheerio.load(readFileSync(builtFile, 'utf8'));
  // The language switcher is new in the Next.js build and has no export counterpart.
  bu('.lang-switch').remove();
  const problems: string[] = [];
  for (const sel of ['main', 'header nav.main', '#mmenu', 'footer']) {
    const a = signature(ex, ex(sel), 'export', lang);
    const b = signature(bu, bu(sel), 'built', lang);
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
      if (a[i] !== b[i]) {
        problems.push(`${sel} @${i}:\n      export: ${a[i] ?? '(end)'}\n      built:  ${b[i] ?? '(end)'}`);
        break;
      }
    }
  }
  return problems;
}

let failed = 0;
let checked = 0;
for (const lang of ['en', 'es'] as const) {
  for (const file of readdirSync(path.join(EXPORT_DIR, lang)).filter((f) => f.endsWith('.html')).sort()) {
    if (filter && !file.includes(filter)) continue;
    checked++;
    let problems: string[];
    try {
      problems = compare(lang, file);
    } catch (e) {
      problems = [(e as Error).message];
    }
    if (problems.length) {
      failed++;
      console.log(`✗ ${lang}/${file}`);
      for (const p of problems) console.log(`    ${p}`);
    } else console.log(`✓ ${lang}/${file}`);
  }
}
console.log(`\n${checked - failed}/${checked} pages match`);
process.exit(failed ? 1 : 0);
