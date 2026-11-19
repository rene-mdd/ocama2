/**
 * Changes the customer approved after the export (new changes/customer-feedback.docx, Nov 2026).
 * Applied to the export's HTML before the parity comparison, so parity checks "export + approved
 * changes" and stays strict about everything else. Values come from the content snapshot.
 */
import type { CheerioAPI } from 'cheerio';
import site from '../content-snapshot/site_settings.json' with { type: 'json' };
import type { Locale } from '../lib/i18n';
import { telUrl, whatsappUrl } from '../lib/contact';

const labels = (lang: Locale) => site.translations.find((t) => t.languages_code === (lang === 'en' ? 'en-US' : 'es-ES'))!;

export function applyApprovedChanges($: CheerioAPI, lang: Locale, file: string) {
  const l = labels(lang);
  const phone = `<a href="${telUrl(site.phone)}">${site.phone_display}</a> <span class="contact-label">${l.phone_label}</span>`;
  const whatsapp = `<a href="${whatsappUrl(site.whatsapp)}">${site.whatsapp_display}</a> <span class="contact-label">${l.whatsapp_label}</span>`;

  // 1. Phone numbers: both numbers, labelled, WhatsApp via wa.me. Footer on every page…
  $('footer a[href^="tel:"]').closest('li').replaceWith(`<li>${phone}</li><li>${whatsapp}</li>`);
  // …and the Speak With Reservations block on Plan Your Stay.
  if (file === 'plan.html') {
    const p = $('main .mrow p').filter((_, el) => $(el).find('a[href^="tel:"]').length > 0);
    const email = p.find('a[href^="mailto:"]').toString();
    const sea = (html: string) => html.replace(/<a /g, '<a class="c-sea-deep" ');
    p.html(`${sea(phone)}<br>${sea(whatsapp)}<br>${email}`);
  }
  // 2. The Hotel: the property map is shown whole.
  // …and opens full screen with zoom (requested after the feedback round): wrapped in a button.
  if (file === 'about.html') $('main img[src*="ocama-map"]').addClass('map-full').wrap('<button class="zoom-trigger"></button>');
  // 3. Villa galleries: each image is a button that opens the lightbox.
  if (file.startsWith('villa-')) $('main .gal img').each((_, el) => void $(el).wrap('<button class="gal-item"></button>'));
  // 5. Press: Fast Facts gets its normal top padding after the green section.
  if (file === 'press.html') $('main section[style="padding-top:0"]').removeAttr('style');
}
