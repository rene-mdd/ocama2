import type { Metadata } from 'next';
import { getSiteSettings } from './directus';
import { defaultLocale, type Locale } from './i18n';
import type { SiteSettings } from './types';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ocama.com').replace(/\/$/, '');

type MetaInput = {
  lang: Locale;
  /** Full <title>, already including "| Ocama" where wanted. */
  title: string;
  description?: string | null;
  /** Path of this page in every language (from routes.alternates). */
  paths: Record<Locale, string>;
  ogImage?: string | null;
  noindex?: boolean;
  canonical?: string | null;
};

/** Every SEO surface comes from a content field with a code-level fallback (ARCHITECTURE.md, SEO). */
export function buildMetadata({ lang, title, description, paths, ogImage, noindex, canonical }: MetaInput): Metadata {
  const site = getSiteSettings(lang);
  const url = SITE_URL + paths[lang];
  return {
    title,
    description: description ?? site.t.meta_description,
    alternates: {
      canonical: canonical ?? url,
      languages: { ...Object.fromEntries(Object.entries(paths).map(([l, p]) => [l, SITE_URL + p])), 'x-default': SITE_URL + paths[defaultLocale] },
    },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: site.t.og_title,
      description: site.t.og_description,
      url,
      type: 'website',
      images: [{ url: ogImage ?? site.og_image }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

/** The Hotel entity, rendered once in the layout from site_settings. */
export function hotelJsonLd(site: SiteSettings & { t: { schema_description: string; site_name: string } }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: site.t.site_name,
    description: site.t.schema_description,
    url: SITE_URL,
    telephone: site.phone,
    email: site.email,
    numberOfRooms: site.number_of_rooms,
    petsAllowed: site.pets_allowed,
    image: site.og_image,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.latitude, longitude: site.longitude },
    sameAs: site.same_as,
    amenityFeature: site.amenities.map((name) => ({ '@type': 'LocationFeatureSpecification', name })),
  };
}
