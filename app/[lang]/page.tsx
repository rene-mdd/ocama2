import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { HomePage } from '@/components/templates/HomePage';
import { getPage } from '@/lib/directus';
import type { Locale } from '@/lib/i18n';
import { alternates } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[lang]'>): Promise<Metadata> {
  const lang = (await params).lang as Locale;
  const page = getPage('home', lang);
  return buildMetadata({
    lang,
    title: page.t.meta_title ?? page.t.title,
    description: page.t.meta_description,
    paths: alternates('home'),
  });
}

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const lang = (await params).lang as Locale;
  setRequestLocale(lang);
  return <HomePage lang={lang} />;
}
