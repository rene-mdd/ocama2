import type { Locale } from '../../lib/i18n';
import type { NavItem, SiteSettings, SiteSettingsT } from '../../lib/types';
import { assertEqual, attr, each, load, rich, text, type $ } from './lib';

const navKey = (href: string) => (href === 'index.html' ? 'home' : href.replace('.html', ''));

function nav(sel: ReturnType<$>): NavItem[] {
  return each(sel, (a) => ({ key: navKey(attr(a, 'href')), label: text(a) }));
}

export function extractSiteT(lang: Locale): SiteSettingsT {
  const $ = load(lang, 'index.html');
  const footCols = $('footer .foot-grid > div');
  const planLinks = footCols.eq(2).find('li a');
  const base = $('footer .foot-base span');

  // The "Included in your stay" block is identical on every villa page; take it from one, check the rest.
  const villaInc = (file: string) => {
    const v = load(lang, file);
    const s = v('main section.pad-dark').first();
    return {
      eyebrow: text(s.find('.section-mark .eyebrow')),
      headline: rich(s.find('h2.display'), lang),
      items: each(s.find('.inc-grid > div'), text),
      note: text(s.find('.wrap > p')),
    };
  };
  const villa_inclusions = villaInc('villa-tanama.html');
  for (const f of ['bagua', 'turey', 'guama', 'ana', 'guada', 'bajacu', 'kachi']) {
    assertEqual(villaInc(`villa-${f}.html`), villa_inclusions, `villa inclusions (${f}, ${lang})`);
  }

  const schema = JSON.parse($('script[type="application/ld+json"]').text());

  return {
    site_name: 'Ocama',
    meta_title: $('title').text().trim(),
    meta_description: attr($('meta[name="description"]'), 'content'),
    og_title: attr($('meta[property="og:title"]'), 'content'),
    og_description: attr($('meta[property="og:description"]'), 'content'),
    schema_description: schema.description,
    reserve_label: text($('header .btn')),
    reserve_long_label: text($('#mmenu a.btn')),
    menu_eyebrow: text($('#mmenu .mm-eyebrow')),
    header_nav: nav($('header nav.main a')),
    mobile_nav: nav($('#mmenu > a:not(.btn)')),
    footer_copy: text(footCols.eq(0).find('p')),
    footer_explore_title: text(footCols.eq(1).find('h5')),
    footer_explore: nav(footCols.eq(1).find('li a')),
    footer_plan_title: text(footCols.eq(2).find('h5')),
    footer_plan_begin: text(planLinks.eq(1)),
    footer_plan_getting_here: text(planLinks.eq(2)),
    footer_copyright: text(base.eq(0)),
    footer_reviews_label: text(base.eq(1)),
    footer_meaning: text(base.eq(2)),
    villa_inclusions,
  };
}

export function extractSiteParent(): Omit<SiteSettings, 'translations'> {
  const $ = load('en', 'index.html');
  const schema = JSON.parse($('script[type="application/ld+json"]').text());
  const plan = $('footer .foot-grid > div').eq(2);
  return {
    phone: schema.telephone,
    phone_display: text(plan.find('a[href^="tel:"]')),
    email: schema.email,
    booking_url: attr($('header .btn'), 'href'),
    google_reviews_url: attr($('footer .foot-base a'), 'href'),
    instagram_url: attr(plan.find('a[href*="instagram"]'), 'href'),
    tiktok_url: attr(plan.find('a[href*="tiktok"]'), 'href'),
    same_as: schema.sameAs,
    latitude: schema.geo.latitude,
    longitude: schema.geo.longitude,
    address: {
      locality: schema.address.addressLocality,
      region: schema.address.addressRegion,
      country: schema.address.addressCountry,
    },
    number_of_rooms: schema.numberOfRooms,
    pets_allowed: schema.petsAllowed,
    amenities: schema.amenityFeature.map((a: { name: string }) => a.name),
    og_image: attr($('meta[property="og:image"]'), 'content'),
    show_offers_banner: false,
    show_newsletter: false,
  };
}
