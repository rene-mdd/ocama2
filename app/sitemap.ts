import type { MetadataRoute } from 'next';
import { getOffers, getPage, getVillas, hasPage, slugsFor } from '@/lib/directus';
import { locales } from '@/lib/i18n';
import { alternates, pageKeys, type PageKey } from '@/lib/routes';
import { SITE_URL } from '@/lib/seo';

/** Both languages of every page, each with its hreflang alternates. Built from content, not the filesystem. */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries = (key: PageKey, paths: Record<string, string>, lastModified?: string) =>
    locales.map((lang) => ({
      url: SITE_URL + paths[lang],
      lastModified,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, SITE_URL + paths[l]])) },
    }));

  return [
    ...pageKeys.filter(hasPage).flatMap((key) => entries(key, alternates(key), getPage(key, 'en').date_updated)),
    ...getVillas('en').flatMap((v) => entries('stay', alternates('stay', slugsFor(v)))),
    ...getOffers('en')
      .filter((o) => !o.noindex)
      .flatMap((o) => entries('offers', alternates('offers', slugsFor(o)), o.date_updated)),
  ];
}
