/**
 * One-off: convert the approved static export into content-snapshot/ JSON shaped like Directus.
 *   npm run extract                       everything
 *   npm run extract -- --pages about,plan  only those fixed pages (content-snapshot/pages/<key>.json)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { SiteSettings } from '../../lib/types';
import { registerOfferSlugs, extractOffers } from './offers';
import { extractSiteParent, extractSiteT } from './site';
import { extractVillas } from './villas';
import { extractPages } from './pages';
import { applyLegacySeo } from './legacy-seo';

const OUT = path.resolve(import.meta.dirname, '../../content-snapshot');
const write = (name: string, data: unknown) => {
  writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2) + '\n');
  console.log(`wrote content-snapshot/${name}`);
};

registerOfferSlugs();

const only = process.argv.includes('--pages') ? process.argv[process.argv.indexOf('--pages') + 1].split(',') : null;

const site: SiteSettings = {
  ...extractSiteParent(),
  translations: [
    { languages_code: 'en-US', ...extractSiteT('en') },
    { languages_code: 'es-ES', ...extractSiteT('es') },
  ],
};
const villas = extractVillas();
const offers = extractOffers();
const pages = extractPages(only);
applyLegacySeo(site, villas, offers, pages);

mkdirSync(path.join(OUT, 'pages'), { recursive: true });
for (const page of pages) write(`pages/${page.key}.json`, page);
if (!only) {
  write('site_settings.json', site);
  write('villas.json', villas);
  write('offers.json', offers);
}
