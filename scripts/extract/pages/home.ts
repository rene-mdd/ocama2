import type { Locale } from '../../../lib/i18n';
import type { HomeImages, HomeSections } from '../../../lib/pages/home';
import { attr, each, load, rich, text } from '../lib';
import type { PageExtract } from '../pages';

export function extract(lang: Locale): PageExtract<HomeImages, HomeSections> {
  const $ = load(lang, 'index.html');
  const m = $('main');
  const hero = m.children('section.phero');
  const mi = m.children('section.m-intro');
  const pads = m.children('section.pad');
  const darks = m.children('section.pad-dark');
  const sands = m.children('section.pad-sand');
  const intro = pads.eq(0);
  const dining = pads.eq(1);
  const sus = pads.eq(2);
  const villas = darks.eq(0);
  const buy = sands.eq(0);
  const exp = sands.eq(1);
  const qb = m.children('.quoteband');
  const band = m.children('.band');
  const card = (c: ReturnType<typeof $>) => ({ title: text(c.find('h4')), text: text(c.find('p')), alt: attr(c.find('img'), 'alt') });

  return {
    title: text(hero.find('h1')),
    meta_title: $('title').text().trim(),
    images: {
      hero_video: attr(hero.find('video source'), 'src'),
      hero_poster: attr(hero.find('video'), 'poster'),
      intro: attr(intro.find('img'), 'src'),
      villa_cards: each(villas.find('.grid3 img'), (i) => attr(i, 'src')),
      dining: attr(dining.find('img'), 'src'),
      experience_cards: each(exp.find('.grid3 img'), (i) => attr(i, 'src')),
    },
    sections: {
      hero: {
        title: rich(hero.find('h1'), lang),
        subtitle: text(hero.find('p.sub')),
        place: text(hero.find('.inner > p.eyebrow')),
        cta_reserve: text(hero.find('.ctas a').eq(0)),
        cta_villa: text(hero.find('.ctas a').eq(1)),
        scroll_cue: text(hero.find('.scrollcue')),
      },
      mobile_intro: { text: text(mi.find('p')), link_label: text(mi.find('a')) },
      statement: { eyebrow: text(m.find('.statement .eyebrow')), text: rich(m.find('.statement p'), lang) },
      stats: each(m.find('.stats > div'), (d) => ({ value: text(d.find('b')), label: text(d.find('span')) })),
      intro: {
        eyebrow: text(intro.find('.eyebrow')),
        headline: rich(intro.find('h2'), lang),
        body: text(intro.find('p.lede').eq(0)),
        quote: text(intro.find('p.lede').eq(1)),
        link_label: text(intro.find('a.link')),
        image_alt: attr(intro.find('img'), 'alt'),
      },
      villas: {
        eyebrow: text(villas.find('.eyebrow')),
        headline: rich(villas.find('h2'), lang),
        cards: each(villas.find('.grid3 > a'), (c) => ({ ...card(c), tag: text(c.find('.tag')) })),
        compare_label: text(villas.find('.wrap > div:last-child a').eq(0)),
        detail_label: text(villas.find('.wrap > div:last-child a').eq(1)),
      },
      buyouts: {
        eyebrow: text(buy.find('p.eyebrow')),
        headline: rich(buy.find('h2'), lang),
        text: text(buy.find('h2 + p')),
        link_label: text(buy.find('a.link')),
      },
      dining: {
        eyebrow: text(dining.find('.eyebrow')),
        headline: rich(dining.find('h2'), lang),
        text: text(dining.find('p.lede')),
        link_label: text(dining.find('a.link')),
        image_alt: attr(dining.find('img'), 'alt'),
      },
      sustainability: {
        eyebrow: text(sus.find('p.eyebrow')),
        lead: text(sus.find('p').eq(1)),
        text: text(sus.find('p').eq(2)),
        link_label: text(sus.find('a.link')),
      },
      experiences: {
        eyebrow: text(exp.find('.eyebrow')),
        headline: rich(exp.find('h2'), lang),
        cards: each(exp.find('.grid3 > a'), card),
      },
      reviews: {
        rating_label: text(qb.find('p.eyebrow a')),
        quotes: each(qb.find('figure.gq'), (f) => ({ text: text(f.find('blockquote')), cite: text(f.find('cite')) })),
        link_label: text(qb.find('a.link')),
      },
      band: {
        headline: rich(band.find('h2'), lang),
        text: text(band.find('p')),
        cta_availability: text(band.find('a').eq(0)),
        cta_plan: text(band.find('a').eq(1)),
      },
    },
  };
}
