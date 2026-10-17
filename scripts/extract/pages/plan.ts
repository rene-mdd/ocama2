import type { Locale } from '../../../lib/i18n';
import type { PlanImages, PlanSections } from '../../../lib/pages/plan';
import { attr, each, heroOf, load, rich, text, type $, type Sel } from '../lib';
import type { PageExtract } from '../pages';

const field = ($: $, id: string) => ({ label: text($(`label[for="${id}"]`)), placeholder: attr($(`#${id}`), 'placeholder') });
const choice = ($: $, id: string) => ({ label: text($(`label[for="${id}"]`)), options: each($(`#${id} option`), text) });

export function extract(lang: Locale): PageExtract<PlanImages, PlanSections> {
  const $ = load(lang, 'plan.html');
  const { image, hero } = heroOf($, lang);
  const grid = $('#plan-grid');
  const [inq, arr] = [grid.children('div').eq(0), grid.children('div').eq(1)];
  const air = $('main > section.pad-dark');
  const faq = $('main > section.pad-sand');
  const mrow = arr.find('.mrow');
  const wa = mrow.find('a[href^="tel:"]').eq(1);
  // Text after the WhatsApp number, before the <br>.
  const waLabel = (wa.get(0)!.nextSibling as unknown as { data?: string })?.data?.trim() ?? '';
  const airPs = air.find('.reveal > p');

  return {
    title: text($('main .phero h1')),
    meta_title: $('title').text().trim(),
    images: { hero: image, air: attr(air.find('img'), 'src') },
    sections: {
      hero,
      inquiry: {
        eyebrow: text(inq.find('.section-mark .eyebrow')),
        dates: field($, 'f-dates'),
        guests: field($, 'f-guests'),
        occasion: choice($, 'f-occasion'),
        villa: choice($, 'f-villa'),
        notes: field($, 'f-notes'),
        send_label: text($('#send-inq')),
        availability_label: text(inq.find('.full a.btn')),
      },
      arrival: {
        eyebrow: text(arr.find('.section-mark .eyebrow')),
        map_label: attr($('#arrival-map'), 'aria-label'),
        caption: text(arr.find('p.caption')),
        items: each(arr.find('.arrive > div'), (d: Sel) => ({
          value: text(d.find('b')),
          label: text(d.find('span')),
          text: text(d.find('p')),
        })),
        road_note: text(arr.children('p.reveal')),
        reservations_title: text(mrow.find('h5')),
        whatsapp_display: text(wa),
        whatsapp_tel: attr(wa, 'href').replace(/^tel:/, ''),
        whatsapp_label: waLabel,
      },
      air: {
        eyebrow: text(air.find('.section-mark .eyebrow')),
        headline: rich(air.find('h2'), lang),
        body: each(air.find('p.lede'), (p: Sel) => rich(p, lang)),
        rates_note: text(airPs.not('.lede')),
        cta_helicopter: text($('#heli-cta')),
        cta_offers: text(air.find('a.link')),
        image_alt: attr(air.find('img'), 'alt'),
      },
      faq: {
        eyebrow: text(faq.find('.section-mark .eyebrow')),
        headline: rich(faq.find('h2'), lang),
        items: each(faq.find('details'), (d: Sel) => ({ question: text(d.find('summary')), answer: rich(d.find('p'), lang) })),
      },
    },
  };
}
