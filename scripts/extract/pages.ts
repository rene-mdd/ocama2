import type { Locale } from '../../lib/i18n';
import type { Page } from '../../lib/types';
import { SEO_NULL, assertEqual } from './lib';
import * as about from './pages/about';
import * as dining from './pages/dining';
import * as experiences from './pages/experiences';
import * as home from './pages/home';
import * as hospitality from './pages/hospitality';
import * as offers from './pages/offers';
import * as plan from './pages/plan';
import * as press from './pages/press';
import * as stay from './pages/stay';
import * as sustainability from './pages/sustainability';
import * as wellness from './pages/wellness';

export type PageExtract<I = unknown, S = unknown> = { title: string; meta_title: string; images: I; sections: S };
type Extractor = { extract: (lang: Locale) => PageExtract | null };

const registry: Record<string, Extractor> = {
  home, about, stay, dining, wellness, experiences, hospitality, sustainability, offers, plan, press,
};

export function extractPages(only: string[] | null): Page[] {
  const out: Page[] = [];
  for (const [key, mod] of Object.entries(registry)) {
    if (only && !only.includes(key)) continue;
    const en = mod.extract('en');
    const es = mod.extract('es');
    if (!en || !es) {
      console.warn(`  skipped page ${key} (extractor not implemented)`);
      continue;
    }
    assertEqual(en.images, es.images, `page ${key} images`);
    out.push({
      key,
      status: 'published',
      date_updated: '2026-10-05T00:00:00Z',
      og_image: null,
      images: en.images as Record<string, unknown>,
      translations: (['en', 'es'] as const).map((lang) => {
        const x = lang === 'en' ? en : es;
        return {
          languages_code: lang === 'en' ? ('en-US' as const) : ('es-ES' as const),
          title: x.title,
          ...SEO_NULL,
          sections: x.sections as Record<string, unknown>,
        };
      }),
    });
  }
  return out;
}
