import type { Locale } from '../../lib/i18n';
import type { ImageRef, Villa, VillaT } from '../../lib/types';
import { SEO_NULL, attr, each, fallbackSrc, load, rich, text, type $ } from './lib';

export const villaIds = ['tanama', 'bagua', 'turey', 'guama', 'ana', 'guada', 'bajacu', 'kachi'];

const img = (el: ReturnType<$>): ImageRef => ({ src: attr(el, 'src'), fallback: fallbackSrc(el) });

function parse(lang: Locale, id: string) {
  const $ = load(lang, `villa-${id}.html`);
  const hero = $('main > section.phero');
  const intro = $('main > section.pad').eq(0);
  const galSec = $('main > section.pad').eq(1);
  const gal = galSec.find('.gal img');
  const quoteEl = galSec.find('.wrap > p');
  const actions = galSec.find('.wrap > div.reveal').last();
  const mIntro = $('main > section.m-intro p');
  const sub = hero.find('p.sub');

  if (mIntro.length !== (sub.hasClass('sub-long') ? 1 : 0)) throw new Error(`m-intro/sub-long mismatch on ${id}`);

  let quote: VillaT['quote'] = null;
  if (quoteEl.length) {
    const cite = quoteEl.find('span');
    const citeText = text(cite).replace(/^·\s*/, '');
    const q = quoteEl.clone();
    q.find('span').remove();
    quote = { text: text(q), cite: citeText };
  }

  const related = each(actions.find('a.btn:not(.btn-solid)'), (a) => {
    const m = attr(a, 'href').match(/^villa-([a-z]+)\.html$/);
    if (!m) throw new Error(`bad related link on ${id}`);
    return { id: m[1], label: text(a) };
  });

  const name = text(hero.find('h1'));
  const t: VillaT = {
    name,
    slug: `casa-${id}`,
    ...SEO_NULL,
    eyebrow: text(hero.find('p.eyebrow')),
    tagline: rich(sub, lang),
    mobile_intro: mIntro.length ? text(mIntro) : null,
    header_alt: attr(hero.children('img'), 'alt'),
    section_eyebrow: text(intro.find('.section-mark .eyebrow')),
    headline: rich(intro.find('h2.display'), lang),
    body: each(intro.find('p.lede'), (p) => rich(p, lang)),
    meta_line: text(intro.find('.meta-line')),
    intro_alt: attr(intro.find('img'), 'alt'),
    gallery_eyebrow: text(galSec.find('.section-mark .eyebrow')),
    gallery_alt: attr(gal.first(), 'alt'),
    quote,
    reserve_label: text(actions.find('a.btn-solid')),
    all_villas_label: text(actions.find('a.link')),
  };
  each(gal, (g) => {
    if (attr(g, 'alt') !== t.gallery_alt) throw new Error(`gallery alt varies on ${id}`);
  });

  return {
    t,
    related,
    parent: {
      header_image: img(hero.children('img')),
      intro_image: img(intro.find('img')),
      // Gallery images with a guessed filename are hidden on error rather than swapped.
      gallery: each(gal, (g) => (g.attr('onerror') ? { src: attr(g, 'src'), hideOnError: true } : { src: attr(g, 'src') })),
      booking_url: attr(actions.find('a.btn-solid'), 'href'),
      og_image: null,
    },
  };
}

export function extractVillas(): Villa[] {
  const villas = villaIds.map((id, i) => {
    const en = parse('en', id);
    const es = parse('es', id);
    if (JSON.stringify(en.parent) !== JSON.stringify(es.parent)) throw new Error(`villa ${id}: images differ between languages`);
    return {
      id,
      sort: i + 1,
      status: 'published' as const,
      ...en.parent,
      related: en.related.map((r) => r.id),
      translations: [
        { languages_code: 'en-US' as const, ...en.t },
        { languages_code: 'es-ES' as const, ...es.t },
      ],
      _related: { en: en.related, es: es.related },
    };
  });
  // Related buttons are labelled with the target villa's name; confirm so the label can be derived.
  for (const v of villas) {
    for (const lang of ['en', 'es'] as const) {
      for (const r of v._related[lang]) {
        const target = villas.find((x) => x.id === r.id)!;
        const name = target.translations[lang === 'en' ? 0 : 1].name;
        if (name !== r.label) throw new Error(`villa ${v.id} related label "${r.label}" != "${name}"`);
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropped from the output
  return villas.map(({ _related, ...v }) => v);
}
