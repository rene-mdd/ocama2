import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { OfferPage } from '@/components/templates/OfferPage';
import { templates } from '@/components/templates/registry';
import { VillaPage } from '@/components/templates/VillaPage';
import { getOffer, getOffers, getPage, hasPage, getVilla, getVillas, slugsFor } from '@/lib/directus';
import { isLocale, locales } from '@/lib/i18n';
import { fixedPages } from '@/lib/pages/registry';
import { alternates, resolve, segments } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo';

/**
 * Known paths are prerendered. Unknown paths render on demand so an offer published in
 * Directus after the build appears without a deploy; anything else resolves to notFound().
 */
export const dynamicParams = true;

/** Every page except home, in both languages, with localized segments. */
export async function generateStaticParams() {
  const perLang = await Promise.all(
    locales.map(async (lang) => [
      ...(await Promise.all(fixedPages.map(async (key) => ((await hasPage(key)) ? key : null))))
        .filter((key): key is (typeof fixedPages)[number] => key !== null)
        .map((key) => ({ lang, segments: [segments[key][lang]] })),
      ...(await getVillas(lang)).map((v) => ({ lang, segments: [segments.stay[lang], v.t.slug] })),
      ...(await getOffers(lang)).map((o) => ({ lang, segments: [segments.offers[lang], o.t.slug] })),
    ]),
  );
  return perLang.flat();
}

async function route(params: PageProps<'/[lang]/[...segments]'>['params']) {
  const { lang, segments: parts } = await params;
  if (!isLocale(lang)) notFound();
  const r = resolve(lang, parts);
  if (!r || r.key === 'home') notFound();
  return { lang, ...r };
}

export async function generateMetadata({ params }: PageProps<'/[lang]/[...segments]'>): Promise<Metadata> {
  const { lang, key, slug } = await route(params);
  if (key === 'stay' && slug) {
    const v = await getVilla(lang, slug);
    if (!v) notFound();
    return buildMetadata({
      lang,
      title: v.t.name,
      seo: v.t,
      paths: alternates('stay', slugsFor(v)),
      ogImage: v.og_image,
    });
  }
  if (key === 'offers' && slug) {
    const o = await getOffer(lang, slug);
    if (!o) notFound();
    return buildMetadata({
      lang,
      title: o.t.title,
      seo: o.t,
      paths: alternates('offers', slugsFor(o)),
      ogImage: o.og_image,
      noindex: o.noindex,
      canonical: o.canonical_url,
    });
  }
  const page = await getPage(key, lang);
  return buildMetadata({
    lang,
    title: page.t.title,
    seo: page.t,
    paths: alternates(key),
    ogImage: page.og_image,
  });
}

export default async function CatchAll({ params }: PageProps<'/[lang]/[...segments]'>) {
  const { lang, key, slug } = await route(params);
  setRequestLocale(lang);
  if (key === 'stay' && slug) {
    const v = await getVilla(lang, slug);
    if (!v) notFound();
    return <VillaPage lang={lang} villa={v} />;
  }
  if (key === 'offers' && slug) {
    const o = await getOffer(lang, slug);
    if (!o) notFound();
    return <OfferPage lang={lang} offer={o} />;
  }
  const Template = templates[key as keyof typeof templates];
  if (!Template) notFound();
  return <Template lang={lang} />;
}
