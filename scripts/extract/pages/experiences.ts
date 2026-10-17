import type { Locale } from '../../../lib/i18n';
import type { ExperiencesImages, ExperiencesSections } from '../../../lib/pages/experiences';
import { attr, each, heroOf, load, rich, text } from '../lib';
import type { PageExtract } from '../pages';

export function extract(lang: Locale): PageExtract<ExperiencesImages, ExperiencesSections> {
  const $ = load(lang, 'experiences.html');
  const m = $('main');
  const { image, hero } = heroOf($, lang);
  const w = m.children('section.pad').eq(0).children('.wrap');
  const marks = w.children('.section-mark');
  const splits = w.children('.split');
  const feature = (i: number) => ({
    eyebrow: text(marks.eq(i).find('.eyebrow')),
    headline: rich(splits.eq(i).find('h2'), lang),
    text: text(splits.eq(i).find('p.lede')),
    image_alt: attr(splits.eq(i).find('img'), 'alt'),
  });
  const actions = w.children('div.reveal').last();

  return {
    title: text(m.find('.phero h1')),
    meta_title: $('title').text().trim(),
    images: { hero: image, sea: attr(splits.eq(0).find('img'), 'src'), forest: attr(splits.eq(1).find('img'), 'src') },
    sections: {
      hero,
      sea: feature(0),
      forest: feature(1),
      pairs: each(w.children('.grid2').children('div'), (d) => ({
        eyebrow: text(d.find('.eyebrow')),
        title: text(d.find('h3')),
        text: text(d.find('p')),
      })),
      cta_plan: text(actions.find('a').eq(0)),
      cta_concierge: text(actions.find('a').eq(1)),
      note: text(m.children('section.pad').eq(1).find('p')),
    },
  };
}
