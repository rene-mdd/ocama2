/**
 * Crawl a running site (`npm start`) from /en and /es and check that every internal link,
 * language switcher target and hreflang alternate returns 200.
 *   npm run links [-- http://localhost:3000]
 */
import * as cheerio from 'cheerio';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const seen = new Map<string, number>();
const queue = ['/en', '/es'];
const problems: string[] = [];

while (queue.length) {
  const p = queue.shift()!;
  if (seen.has(p)) continue;
  const res = await fetch(BASE + p, { redirect: 'manual' });
  seen.set(p, res.status);
  if (res.status !== 200) continue;
  const $ = cheerio.load(await res.text());
  $('a[href^="/"]').each((_, a) => {
    const h = $(a).attr('href')!.split('#')[0];
    if (!seen.has(h)) queue.push(h);
  });
  const alts = $('link[rel="alternate"][hreflang]')
    .toArray()
    .map((l) => [$(l).attr('hreflang')!, new URL($(l).attr('href')!).pathname] as const);
  const lang = p.split('/')[1];
  const self = alts.find(([l]) => l === lang)?.[1];
  if (self !== p) problems.push(`${p}: hreflang ${lang} points at ${self}`);
  for (const [, alt] of alts) if (!seen.has(alt)) queue.push(alt);
  const sw = $('.lang-switch').attr('href');
  const other = alts.find(([l]) => l !== lang && l !== 'x-default')?.[1];
  if (sw !== other) problems.push(`${p}: language switcher → ${sw}, hreflang → ${other}`);
}

for (const [p, s] of seen) if (s !== 200) problems.push(`${p}: HTTP ${s}`);
console.log(`${seen.size} URLs crawled`);
problems.forEach((x) => console.log(`✗ ${x}`));
process.exit(problems.length ? 1 : 0);
