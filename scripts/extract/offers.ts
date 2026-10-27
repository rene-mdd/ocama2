import type { Locale } from '../../lib/i18n';
import type { Offer, OfferT } from '../../lib/types';
import { validUntilLabel } from '../../lib/format';
import { SEO_NULL, attr, each, fallbackSrc, load, offerSlugs, rich, slugify, text } from './lib';

/** In the order shown on the offers index. */
export const offerIds = ['extend', 'taste', 'discovery', 'romance', 'longer', 'dominican'];

/** Must run before anything that rewrites links, so offer-*.html links can be mapped. */
export function registerOfferSlugs() {
  for (const lang of ['en', 'es'] as const) {
    for (const id of offerIds) offerSlugs[lang][id] = slugify(text(load(lang, `offer-${id}.html`)('main .phero h1')));
  }
}

function parse(lang: Locale, id: string) {
  const $ = load(lang, `offer-${id}.html`);
  const index = load(lang, 'offers.html');
  const card = index(`main a.card[href="offer-${id}.html"]`);
  const hero = $('main > section.phero');
  const heroImg = hero.children('img');
  const w = $('main > section.pad .wrap');
  const actions = w.children('div.reveal').last();
  const terms = w.children('p').not('.lede').not('.meta-line');

  const t: OfferT = {
    title: text(hero.find('h1')),
    slug: offerSlugs[lang][id],
    summary: text(hero.find('p.sub')),
    stay_length: text(card.find('.meta-line')),
    body: rich(w.children('p.lede'), lang),
    ...SEO_NULL,
    alt_text: attr(heroImg, 'alt'),
    eyebrow: text(hero.find('p.eyebrow')),
    includes_eyebrow: text(w.find('.section-mark .eyebrow')),
    inclusions: each(w.find('.inc-grid > div'), text),
    details: each(w.children('details'), (d) => ({ summary: text(d.find('summary')), body: rich(d.find('p'), lang) })),
    terms_note: terms.length ? text(terms) : null,
    cta_label: text(actions.find('a.btn-solid')),
    speak_label: text(actions.find('a.link').eq(0)),
    back_label: text(actions.find('a.link').eq(1)),
  };
  if (text(card.find('h4')) !== t.title) throw new Error(`offer ${id}: card title differs`);
  if (text(card.find('p')) !== t.summary) throw new Error(`offer ${id}: card summary differs`);
  if (attr(card.find('img'), 'alt') !== t.alt_text) throw new Error(`offer ${id}: card alt differs`);

  const validity = w.children('p.meta-line');
  return {
    t,
    validity: validity.length ? text(validity) : null,
    parent: {
      image: { src: attr(heroImg, 'src'), fallback: fallbackSrc(heroImg) },
      booking_url: attr(actions.find('a.btn-solid'), 'href'),
    },
  };
}

export function extractOffers(): Offer[] {
  return offerIds.map((id, i) => {
    const en = parse('en', id);
    const es = parse('es', id);
    if (JSON.stringify(en.parent) !== JSON.stringify(es.parent)) throw new Error(`offer ${id}: parent fields differ`);
    const valid_until = id === 'extend' ? '2027-06-05' : null;
    // The "valid until" line is rendered from valid_until with Intl; confirm it reproduces the approved copy.
    for (const [lang, x] of [['en', en], ['es', es]] as const) {
      const expected = valid_until ? validUntilLabel(lang, valid_until) : null;
      if (expected !== x.validity) throw new Error(`offer ${id} (${lang}): validity "${x.validity}" != "${expected}"`);
    }
    return {
      id,
      status: 'published',
      sort: i + 1,
      ...en.parent,
      og_image: null,
      price: null,
      publish_at: null,
      valid_from: null,
      valid_until,
      date_updated: '2026-10-05T00:00:00Z',
      noindex: false,
      canonical_url: null,
      translations: [
        { languages_code: 'en-US', ...en.t },
        { languages_code: 'es-ES', ...es.t },
      ],
    };
  });
}
