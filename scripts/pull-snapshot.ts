/**
 * Rewrites content-snapshot/ from Directus (ARCHITECTURE.md, "Content snapshot"): run it after a
 * successful build and commit the result. `git diff` then shows what content changed, and a
 * build during a Directus outage reproduces the last published site. Images are stored as
 * Directus file ids, resolved through ASSETS_BASE_URL (the bucket) or DIRECTUS_URL.
 *   DIRECTUS_URL=… DIRECTUS_BUILD_TOKEN=… npm run snapshot
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { mapOffer, mapPage, mapSiteSettings, mapVilla, type Row } from '../lib/cms/map';
import { queries } from '../lib/cms/queries';
import { pageKeys } from '../lib/routes';

const URL_BASE = process.env.DIRECTUS_URL?.replace(/\/$/, '');
const TOKEN = process.env.DIRECTUS_BUILD_TOKEN;
if (!URL_BASE || !TOKEN) throw new Error('Set DIRECTUS_URL and DIRECTUS_BUILD_TOKEN');

async function get<T>(q: string): Promise<T> {
  const res = await fetch(URL_BASE + q, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Directus ${res.status} for ${q}`);
  const { data } = (await res.json()) as { data: T };
  if (data == null || (Array.isArray(data) && !data.length)) throw new Error(`Directus returned empty data for ${q}`);
  return data;
}

const OUT = path.resolve(import.meta.dirname, '../content-snapshot');
const write = (name: string, data: unknown) => {
  writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2) + '\n');
  console.log(`wrote content-snapshot/${name}`);
};

// Everything is fetched before anything is written, so a failure never leaves a half-updated snapshot.
const site = mapSiteSettings(await get<Row>(queries.site()));
const villas = (await get<Row[]>(queries.villas())).map((r) => mapVilla(r, site.og_image));
const offers = (await get<Row[]>(queries.offers())).map((r) => mapOffer(r, site.og_image));
const pages = await Promise.all(pageKeys.map(async (key) => mapPage(key, await get<Row>(queries.page(key)))));
const redirects = await get<Row[]>(queries.redirects());

write('site_settings.json', site);
write('villas.json', villas);
write('offers.json', offers);
mkdirSync(path.join(OUT, 'pages'), { recursive: true });
for (const p of pages) write(`pages/${p.key}.json`, p);
write('redirects.json', redirects);
