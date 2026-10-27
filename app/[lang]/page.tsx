import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { HomePage } from '@/components/templates/HomePage';
import { getPage } from '@/lib/directus';
import { isLocale, type Locale } from '@/lib/i18n';
import { alternates } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo';

async function locale(params: PageProps<'/[lang]'>['params']): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
}

export async function generateMetadata({ params }: PageProps<'/[lang]'>): Promise<Metadata> {
  const lang = await locale(params);
  const page = await getPage('home', lang);
  return buildMetadata({
    lang,
    title: page.t.title,
    seo: page.t,
    paths: alternates('home'),
    ogImage: page.og_image,
  });
}

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const lang = await locale(params);
  setRequestLocale(lang);
  return <HomePage lang={lang} />;
}
