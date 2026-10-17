import type { Locale } from '../../../lib/i18n';
import type { OffersImages, OffersSections } from '../../../lib/pages/offers';
import { each, heroOf, load, text } from '../lib';
import type { PageExtract } from '../pages';

export function extract(lang: Locale): PageExtract<OffersImages, OffersSections> {
  const $ = load(lang, 'offers.html');
  const { image, hero } = heroOf($, lang);
  const note = $('main > section.pad .wrap > p');
  const parts = note.contents().toArray();
  const i = parts.findIndex((n) => n.type === 'tag');
  const a = note.children('a');
  if (a.length !== 1 || a.attr('href') !== 'plan.html' || parts.length !== 3 || i !== 1) {
    throw new Error('offers footnote: expected "text <a href=plan.html>label</a> text"');
  }
  const txt = (n: (typeof parts)[number]) => $(n).text().replace(/\s+/g, ' ');
  const labels = each($('main a.card .link'), text);
  if (new Set(labels).size !== 1) throw new Error('offers: card labels differ');
  return {
    title: text($('main .phero h1')),
    meta_title: $('title').text().trim(),
    images: { hero: image },
    sections: {
      hero: { ...hero, cta_inquiry: text($('main .phero .ctas a')) },
      card_label: labels[0],
      footnote: { before: txt(parts[0]).trimStart(), link_label: text(a), after: txt(parts[2]).trimEnd() },
    },
  };
}
