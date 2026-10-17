import type { Locale } from '../../../lib/i18n';
import type { PressImages, PressSections } from '../../../lib/pages/press';
import { attr, each, heroOf, load, rich, text, type Sel } from '../lib';
import type { PageExtract } from '../pages';

export function extract(lang: Locale): PageExtract<PressImages, PressSections> {
  const $ = load(lang, 'press.html');
  const m = $('main');
  const { image, hero } = heroOf($, lang);
  const st = m.children('section.statement');
  const pads = m.children('section.pad');
  const [featured, coverage, facts, angles, contact] = [0, 1, 2, 3, 4].map((i) => pads.eq(i));
  const items = coverage.find('.wrap > div.reveal > div');
  const eyebrow = (s: Sel) => text(s.find('.section-mark .eyebrow'));
  const titled = (d: Sel) => ({ title: text(d.find('h4')), text: text(d.find('p')) });
  const actions = contact.find('.wrap > div.reveal');

  return {
    title: text(m.find('.phero h1')),
    meta_title: $('title').text().trim(),
    images: { hero: image, coverage_urls: each(items, (d) => attr(d.find('a'), 'href')) },
    sections: {
      hero,
      boilerplate: { eyebrow: text(st.find('.eyebrow')), text: rich(st.find('p'), lang) },
      featured: {
        eyebrow: eyebrow(featured),
        outlets: featured
          .find('.wrap > p')
          .text()
          .split('·')
          .map((s) => s.replace(/\s+/g, ' ').trim()),
      },
      coverage: {
        eyebrow: eyebrow(coverage),
        items: each(items, (d) => ({
          source: text(d.find('p.eyebrow')),
          headline: text(d.find('p').eq(1)),
          link_label: text(d.find('a')),
        })),
      },
      facts: { eyebrow: eyebrow(facts), items: each(facts.find('.grid3 > div'), titled) },
      angles: {
        eyebrow: eyebrow(angles),
        headline: rich(angles.find('h2'), lang),
        items: each(angles.find('.grid3 > div'), (d) => {
          const p = d.find('p').clone();
          const title = text(p.find('b'));
          p.find('b, br').remove();
          return { title, text: text(p) };
        }),
      },
      contact: {
        eyebrow: eyebrow(contact),
        headline: rich(contact.find('h2'), lang),
        text: text(contact.find('p.lede')),
        mailto: attr(actions.find('a.btn'), 'href'),
        cta: text(actions.find('a.btn')),
        instagram_label: text(actions.find('a.link')),
        note: text(contact.find('.wrap > p.reveal:not(.lede)')),
      },
    },
  };
}
