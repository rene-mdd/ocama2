import type { Locale } from '../../../lib/i18n';
import type { HospitalityImages, HospitalitySections } from '../../../lib/pages/hospitality';
import { each, heroOf, load, rich, text } from '../lib';
import type { PageExtract } from '../pages';

export function extract(lang: Locale): PageExtract<HospitalityImages, HospitalitySections> {
  const $ = load(lang, 'hospitality.html');
  const m = $('main');
  const { image, hero } = heroOf($, lang);
  const w = m.children('section.pad').find('.wrap');
  const titles = w.children('p.eyebrow');
  const grids = w.children('.inc-grid');
  const band = m.children('.band');

  return {
    title: text(m.find('.phero h1')),
    meta_title: $('title').text().trim(),
    images: { hero: image },
    sections: {
      hero,
      care: {
        eyebrow: text(w.find('.section-mark .eyebrow')),
        headline: rich(w.children('h2'), lang),
        included_title: text(titles.eq(0)),
        included: each(grids.eq(0).children('div'), text),
        carte_title: text(titles.eq(1)),
        carte: each(grids.eq(1).children('div'), text),
        note: text(w.children('p').not('.eyebrow')),
      },
      band: { headline: rich(band.find('h2'), lang), text: text(band.find('p')), cta: text(band.find('a')) },
    },
  };
}
