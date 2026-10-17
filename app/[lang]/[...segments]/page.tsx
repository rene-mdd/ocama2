import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { OfferPage } from '@/components/templates/OfferPage';
import { templates } from '@/components/templates/registry';
import { VillaPage } from '@/components/templates/VillaPage';
import { getOffer, getOffers, getPage, hasPage, getVilla, getVillas, slugsFor } from '@/lib/directus';
import { locales, type Locale } from '@/lib/i18n';
import { fixedPages } from '@/lib/pages/registry';
import { alternates, resolve, segments } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo';

export const dynamicParams = false;

/** Every page except home, in both languages, with localized segments. */
export function generateStaticParams() {
  return locales.flatMap((lang) => [
    ...fixedPages.filter(hasPage).map((key) => ({ lang, segments: [segments[key][lang]] })),
    ...getVillas(lang).map((v) => ({ lang, segments: [segments.stay[lang], v.t.slug] })),
    ...getOffers(lang).map((o) => ({ lang, segments: [segments.offers[lang], o.t.slug] })),
  ]);
}

async function route(params: PageProps<'/[lang]/[...segments]'>['params']) {
  const { lang, segments: parts } = await params;
  const r = resolve(lang as Locale, parts);
  if (!r || r.key === 'home') notFound();
  return { lang: lang as Locale, ...r };
}

export async function generateMetadata({ params }: PageProps<'/[lang]/[...segments]'>): Promise<Metadata> {
  const { lang, key, slug } = await route(params);
  if (key === 'stay' && slug) {
    const v = getVilla(lang, slug);
    if (!v) notFound();
    return buildMetadata({
      lang,
      title: v.t.meta_title ?? `${v.t.name} | Ocama`,
      description: v.t.meta_description,
      paths: alternates('stay', slugsFor(v)),
    });
  }
  if (key === 'offers' && slug) {
    const o = getOffer(lang, slug);
    if (!o) notFound();
    return buildMetadata({
      lang,
      title: o.t.meta_title ?? `${o.t.title} | Ocama`,
      description: o.t.meta_description,
      paths: alternates('offers', slugsFor(o)),
      ogImage: o.og_image,
      noindex: o.noindex,
      canonical: o.canonical_url,
    });
  }
  const page = getPage(key, lang);
  return buildMetadata({
    lang,
    title: page.t.meta_title ?? `${page.t.title} | Ocama`,
    description: page.t.meta_description,
    paths: alternates(key),
  });
}

export default async function CatchAll({ params }: PageProps<'/[lang]/[...segments]'>) {
  const { lang, key, slug } = await route(params);
  setRequestLocale(lang);
  if (key === 'stay' && slug) {
    const v = getVilla(lang, slug);
    if (!v) notFound();
    return <VillaPage lang={lang} villa={v} />;
  }
  if (key === 'offers' && slug) {
    const o = getOffer(lang, slug);
    if (!o) notFound();
    return <OfferPage lang={lang} offer={o} />;
  }
  const Template = templates[key as keyof typeof templates];
  if (!Template) notFound();
  return <Template lang={lang} />;
}
