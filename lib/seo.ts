import type { Metadata } from 'next';
import { getSiteSettings, isPreview } from './directus';
import { defaultLocale, type Locale } from './i18n';
import { absoluteAssetUrl } from './assets';
import type { SeoT, SiteSettings } from './types';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ocama.com').replace(/\/$/, '');

type MetaInput = {
  lang: Locale;
  /** The page's own heading, used when meta_title is empty: "<title> - OCAMA". */
  title: string;
  /** The page's search & sharing fields (any collection's translation). */
  seo: SeoT;
  /** Path of this page in every language (from routes.alternates). */
  paths: Record<Locale, string>;
  /** Share image: Directus file id, site path or URL (lib/assets.ts). Falls back to the site default. */
  ogImage?: string | null;
  noindex?: boolean;
  canonical?: string | null;
};

/** Every SEO surface comes from a content field with a code-level fallback (ARCHITECTURE.md, SEO). */
export async function buildMetadata({ lang, title, seo, paths, ogImage, noindex, canonical }: MetaInput): Promise<Metadata> {
  const site = await getSiteSettings(lang);
  // Draft previews must never be indexed (ARCHITECTURE.md, Draft preview).
  if (await isPreview()) noindex = true;
  const url = SITE_URL + paths[lang];
  const metaTitle = seo.meta_title ?? `${title} - OCAMA`;
  const description = seo.meta_description ?? site.t.meta_description;
  const ogTitle = seo.og_title ?? metaTitle;
  const ogDescription = seo.og_description ?? description;
  const image = {
    url: absoluteAssetUrl(ogImage ?? site.og_image),
    alt: (ogImage ? seo.og_image_alt : (seo.og_image_alt ?? site.t.og_image_alt)) ?? undefined,
  };
  return {
    title: metaTitle,
    description,
    alternates: {
      canonical: canonical ?? url,
      languages: {
        ...Object.fromEntries(Object.entries(paths).map(([l, p]) => [l, SITE_URL + p])),
        'x-default': SITE_URL + paths[defaultLocale],
      },
    },
    robots: noindex ? { index: false, follow: !(await isPreview()) } : undefined,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      siteName: site.t.site_name,
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description: ogDescription, images: [image] },
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
    image: absoluteAssetUrl(site.og_image),
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
