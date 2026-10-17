import type { Locale } from '../../../lib/i18n';
import type { SustainabilityImages, SustainabilitySections } from '../../../lib/pages/sustainability';
import { each, heroOf, load, rich, text } from '../lib';
import type { PageExtract } from '../pages';

export function extract(lang: Locale): PageExtract<SustainabilityImages, SustainabilitySections> {
  const $ = load(lang, 'sustainability.html');
  const m = $('main');
  const { image, hero } = heroOf($, lang);
  const st = m.children('section.statement');
  const pads = m.children('section.pad');
  const choice = pads.eq(0);
  const prac = pads.eq(1);
  const closing = pads.eq(2);

  return {
    title: text(m.find('.phero h1')),
    meta_title: $('title').text().trim(),
    images: { hero: image },
    sections: {
      hero,
      statement: { eyebrow: text(st.find('.eyebrow')), text: rich(st.find('p'), lang) },
      choice: {
        eyebrow: text(choice.find('.section-mark .eyebrow')),
        headline: rich(choice.find('h2'), lang),
        text: rich(choice.find('p.lede'), lang),
      },
      practices: {
        eyebrow: text(prac.find('.section-mark .eyebrow')),
        headline: rich(prac.find('h2'), lang),
        items: each(prac.find('.grid3 > div'), (d) => ({ title: text(d.find('h4')), text: text(d.find('p')) })),
      },
      closing: {
        text: rich(closing.find('.wrap > p'), lang),
        cta_plan: text(closing.find('a.btn')),
        link_story: text(closing.find('a.link')),
      },
    },
  };
}
