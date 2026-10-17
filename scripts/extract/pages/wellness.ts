import type { Locale } from '../../../lib/i18n';
import type { WellnessImages, WellnessSections } from '../../../lib/pages/wellness';
import { attr, each, heroOf, load, text } from '../lib';
import type { PageExtract } from '../pages';

export function extract(lang: Locale): PageExtract<WellnessImages, WellnessSections> {
  const $ = load(lang, 'wellness.html');
  const m = $('main');
  const { image, hero } = heroOf($, lang);
  const sec = m.children('section.pad');
  const cards = sec.find('.grid2 > .card');
  const after = sec.find('.wrap > div.reveal');
  const ctas = after.find('a');

  return {
    title: text(m.find('.phero h1')),
    meta_title: $('title').text().trim(),
    images: { hero: image, cards: each(cards.find('img'), (i) => attr(i, 'src')) },
    sections: {
      hero,
      cards: each(cards, (c) => ({ title: text(c.find('h4')), text: text(c.find('p')), alt: attr(c.find('img'), 'alt') })),
      note: text(after.children('p')),
      cta_plan: text(ctas.eq(0)),
      cta_hospitality: text(ctas.eq(1)),
    },
  };
}
