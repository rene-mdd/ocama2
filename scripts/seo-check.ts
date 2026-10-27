/**
 * SEO check over the built site (npm run build first):
 *   - every page has title, description, canonical, hreflang en/es/x-default, og:title,
 *     og:description, an absolute og:image on this site or the asset host, og:image:alt
 *   - no duplicate titles or descriptions within a language
 *   - no SEO tag points at the old WordPress host
 *   - warns when a description is longer than Google shows
 *   npm run seo
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const BUILD = path.resolve(import.meta.dirname, '..', process.env.NEXT_DIST_DIR ?? '.next', 'server/app');
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ocama.com').replace(/\/$/, '');
const ASSETS = process.env.ASSETS_BASE_URL;

const files: string[] = [];
const walk = (dir: string) => {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) files.push(p);
  }
};
for (const lang of ['en', 'es']) {
  files.push(path.join(BUILD, `${lang}.html`));
  walk(path.join(BUILD, lang));
}

const problems: string[] = [];
const warnings: string[] = [];
const seen: Record<string, Map<string, string>> = {};
const once = (lang: string, kind: string, value: string, page: string) => {
  const m = (seen[`${lang}:${kind}`] ??= new Map());
  if (m.has(value)) problems.push(`${page}: duplicate ${kind} with ${m.get(value)}: "${value}"`);
  else m.set(value, page);
};

for (const file of files.sort()) {
  const page = '/' + path.relative(BUILD, file).replace(/\.html$/, '');
  const lang = page.split('/')[1];
  const $ = cheerio.load(readFileSync(file, 'utf8'));
  const meta = (sel: string) => $(sel).attr('content')?.trim();
  const need = (what: string, v: string | undefined) => {
    if (!v) problems.push(`${page}: missing ${what}`);
    return v ?? '';
  };

  const title = need('<title>', $('title').text().trim());
  const description = need('meta description', meta('meta[name="description"]'));
  need('canonical', $('link[rel="canonical"]').attr('href'));
  for (const hl of ['en', 'es', 'x-default']) need(`hreflang ${hl}`, $(`link[rel="alternate"][hreflang="${hl}"]`).attr('href'));
  need('og:title', meta('meta[property="og:title"]'));
  need('og:description', meta('meta[property="og:description"]'));
  need('og:url', meta('meta[property="og:url"]'));
  need('og:image:alt', meta('meta[property="og:image:alt"]'));
  const image = need('og:image', meta('meta[property="og:image"]'));
  if (image && !image.startsWith(SITE + '/') && !(ASSETS && image.startsWith(ASSETS))) {
    problems.push(`${page}: og:image not on ${SITE} or the asset host: ${image}`);
  }
  // Google shows about 155-160 characters; longer descriptions (carried over from the old site) get cut off.
  if (description.length > 160) warnings.push(`${page}: description is ${description.length} chars, Google will truncate it`);
  const seoUrls = $('meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], link[rel="alternate"]')
    .toArray()
    .map((el) => $(el).attr('content') ?? $(el).attr('href') ?? '');
  if (seoUrls.some((u) => u.includes('wpbackend'))) problems.push(`${page}: an SEO tag still references the old WordPress host`);
  once(lang, 'title', title, page);
  once(lang, 'description', description, page);
}

console.log(`${files.length} pages checked`);
for (const w of warnings) console.log(`! ${w}`);
for (const p of problems) console.log(`✗ ${p}`);
process.exit(problems.length ? 1 : 0);
