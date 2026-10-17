import type { Locale } from '../../../lib/i18n';
import type { AboutImages, AboutSections } from '../../../lib/pages/about';
import { attr, each, heroOf, load, rich, text } from '../lib';
import type { PageExtract } from '../pages';

export function extract(lang: Locale): PageExtract<AboutImages, AboutSections> {
  const $ = load(lang, 'about.html');
  const m = $('main');
  const { image, hero } = heroOf($, lang);
  const story = m.children('section.pad').eq(0);
  const harmony = m.children('section.pad-dark');
  const retreat = m.children('section.pad').eq(1);
  const founder = attr(story.find('img'), 'src');
  if (founder !== 'img/mark-andrus-family.jpg') throw new Error(`about: unexpected founder photo ${founder}`);

  return {
    title: text(m.find('.phero h1')),
    meta_title: $('title').text().trim(),
    images: {
      hero: image,
      // The only locally hosted image in the export; served from public/static.
      founder: '/static/mark-andrus-family.jpg',
      map: attr(retreat.find('img'), 'src'),
    },
    sections: {
      hero,
      story: {
        eyebrow: text(story.find('.eyebrow')),
        headline: rich(story.find('h2'), lang),
        body: text(story.find('p.lede').eq(0)),
        quote: text(story.find('p.lede').eq(1)),
        quote_cite: text(story.find('.reveal > p:not(.lede)')),
        image_alt: attr(story.find('img'), 'alt'),
      },
      harmony: {
        eyebrow: text(harmony.find('.section-mark .eyebrow')),
        headline: rich(harmony.find('h2'), lang),
        body: text(harmony.find('p.lede')),
        pillars: each(harmony.find('.grid2 > div'), (d) => ({ title: text(d.find('h3')), text: text(d.find('p')) })),
      },
      retreat: {
        eyebrow: text(retreat.find('.eyebrow')),
        headline: rich(retreat.find('h2'), lang),
        body: text(retreat.find('p.lede')),
        image_alt: attr(retreat.find('img'), 'alt'),
      },
    },
  };
}
