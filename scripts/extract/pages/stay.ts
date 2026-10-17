import type { Locale } from '../../../lib/i18n';
import type { StayImages, StaySections } from '../../../lib/pages/stay';
import { attr, each, heroOf, load, rich, text } from '../lib';
import type { PageExtract } from '../pages';
import { villaIds } from '../villas';

export function extract(lang: Locale): PageExtract<StayImages, StaySections> {
  const $ = load(lang, 'stay.html');
  const m = $('main');
  const { image, hero } = heroOf($, lang);
  const grid = m.children('section.pad').find('.grid3');
  const cards = grid.children('a.villa-card');
  const help = grid.children('div.card');
  const cmp = m.children('section#compare');

  const hrefs = each(cards, (c) => attr(c, 'href'));
  if (JSON.stringify(hrefs) !== JSON.stringify(villaIds.map((id) => `villa-${id}.html`))) {
    throw new Error(`stay: villa card order ${hrefs.join(',')} differs from villa sort order`);
  }

  /** "Casa Tanama <span>· "butterfly"</span>" → name + meaning. */
  const named = (el: ReturnType<typeof $>, spanSel: string, prefix: RegExp) => {
    const span = el.find(spanSel);
    const c = el.clone();
    c.find(spanSel).remove();
    return { name: text(c), meaning: span.length ? text(span).replace(prefix, '') : null };
  };

  return {
    title: text(m.find('.phero h1')),
    meta_title: $('title').text().trim(),
    images: { hero: image, villa_cards: each(cards, (c) => attr(c.find('img'), 'src')) },
    sections: {
      hero,
      cards: each(cards, (c) => ({
        ...named(c.find('h4'), 'span', /^·\s*/),
        meta_line: text(c.find('.meta-line')),
        text: text(c.find('p')),
        alt: attr(c.find('img'), 'alt'),
      })),
      help_card: { title: text(help.find('h4')), text: text(help.find('p')), cta: text(help.find('a')) },
      compare: {
        eyebrow: text(cmp.find('.section-mark .eyebrow')),
        headline: rich(cmp.find('h2'), lang),
        intro: text(cmp.find('p.lede')),
        columns: each(cmp.find('thead th'), text),
        rows: each(cmp.find('tbody tr'), (tr) => ({
          ...named(tr.children('td').first(), 'span.tn', /^$/),
          cells: each(tr.children('td').slice(1), text),
        })),
        note: text(cmp.find('.wrap > p.reveal:not(.lede)')),
        cta_availability: text(cmp.find('.wrap > div.reveal a').eq(0)),
        cta_help: text(cmp.find('.wrap > div.reveal a').eq(1)),
      },
    },
  };
}
