'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/lib/i18n';
import { href, resolve, type DetailKey } from '@/lib/routes';

/** Slug of every villa and offer per language, so the switcher can find the counterpart page. */
export type DetailSlugs = Record<DetailKey, Record<Locale, string>[]>;

export function LanguageSwitcher({ lang, details }: { lang: Locale; details: DetailSlugs }) {
  const t = useTranslations('languageSwitcher');
  const pathname = usePathname();
  const other = locales.find((l) => l !== lang)!;
  const route = resolve(lang, pathname.split('/').filter(Boolean).slice(1));

  let target = href(other, 'home');
  if (route) {
    if (route.slug && (route.key === 'stay' || route.key === 'offers')) {
      const pair = details[route.key].find((d) => d[lang] === route.slug);
      target = pair ? href(other, route.key, pair[other]) : href(other, route.key);
    } else {
      target = href(other, route.key);
    }
  }

  return (
    <Link className="lang-switch" href={target} hrefLang={other} lang={other} aria-label={t('label')}>
      {t('short')}
    </Link>
  );
}
