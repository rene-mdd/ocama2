import type { Locale } from '../../../lib/i18n';
import type { DiningImages, DiningSections } from '../../../lib/pages/dining';
import { attr, each, heroOf, load, rich, text } from '../lib';
import type { PageExtract } from '../pages';

export function extract(lang: Locale): PageExtract<DiningImages, DiningSections> {
  const $ = load(lang, 'dining.html');
  const m = $('main');
  const { image, hero } = heroOf($, lang);
  const chef = m.children('section.pad').eq(0);
  const ways = m.children('section.pad-sand');
  const cuisine = m.children('section.pad').eq(1);
  const ctas = ways.find('.wrap > div.reveal').last().find('a');

  return {
    title: text(m.find('.phero h1')),
    meta_title: $('title').text().trim(),
    images: {
      hero: image,
      chef: attr(chef.find('img'), 'src'),
      cuisine: attr(cuisine.find('img'), 'src'),
      sample_menus_url: attr(ctas.eq(1), 'href'),
    },
    sections: {
      hero,
      chef: {
        eyebrow: text(chef.find('.eyebrow')),
        headline: rich(chef.find('h2'), lang),
        body: each(chef.find('p.lede'), (p) => rich(p, lang)),
        image_alt: attr(chef.find('img'), 'alt'),
      },
      ways: {
        eyebrow: text(ways.find('.section-mark .eyebrow')),
        rows: each(ways.find('.mrow'), (r) => ({ title: text(r.find('h5')), text: text(r.find('p')) })),
        cta_plan: text(ctas.eq(0)),
        cta_menus: text(ctas.eq(1)),
      },
      cuisine: {
        eyebrow: text(cuisine.find('.eyebrow')),
        headline: rich(cuisine.find('h2'), lang),
        body: text(cuisine.find('p.lede')),
        image_alt: attr(cuisine.find('img'), 'alt'),
      },
    },
  };
}
