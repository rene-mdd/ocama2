import { Cormorant_Garamond, Jost, Julius_Sans_One } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { RevealObserver } from '@/components/client/RevealObserver';
import { Footer } from '@/components/layout/Footer';
import { PreviewBar } from '@/components/layout/PreviewBar';
import { Header, type NavLink } from '@/components/layout/Header';
import type { DetailSlugs } from '@/components/layout/LanguageSwitcher';
import { SpiralSprite } from '@/components/Spiral';
import { getOffers, getSiteSettings, getVillas, isPreview, slugsFor } from '@/lib/directus';
import { isLocale, locales, type Locale } from '@/lib/i18n';
import { hotelJsonLd } from '@/lib/seo';
import { href, type PageKey } from '@/lib/routes';
import type { NavItem } from '@/lib/types';
// Leaflet's stylesheet first so the export's .leaflet-* overrides win, as in the export.
import 'leaflet/dist/leaflet.css';
import '../globals.css';

const julius = Julius_Sans_One({ weight: '400', subsets: ['latin'], variable: '--font-julius' });
const cormorant = Cormorant_Garamond({
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
});
const jost = Jost({ weight: ['300', '400', '500'], subsets: ['latin'], variable: '--font-jost' });

// No dynamicParams = false here: it is inherited by child routes and would stop offers published
// after the build from rendering. Unknown locales are rejected below with notFound().

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const links = (lang: Locale, items: NavItem[]): NavLink[] =>
  items.map((n) => ({ ...n, href: href(lang, n.key as PageKey) }));

export default async function LangLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  setRequestLocale(lang);

  const site = await getSiteSettings(lang);
  const details: DetailSlugs = {
    stay: (await getVillas(lang)).map(slugsFor),
    offers: (await getOffers(lang)).map(slugsFor),
  };

  return (
    <html lang={lang} className={`${julius.variable} ${cormorant.variable} ${jost.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd(site)).replace(/</g, '\\u003c') }}
        />
        <SpiralSprite />
        <NextIntlClientProvider locale={lang} messages={await getMessages({ locale: lang })}>
          <Header
            lang={lang}
            homeHref={href(lang, 'home')}
            nav={links(lang, site.t.header_nav)}
            mobileNav={links(lang, site.t.mobile_nav)}
            menuEyebrow={site.t.menu_eyebrow}
            bookingUrl={site.booking_url}
            reserveLabel={site.t.reserve_label}
            reserveLongLabel={site.t.reserve_long_label}
            details={details}
          />
          {children}
          <Footer site={site} t={site.t} explore={links(lang, site.t.footer_explore)} planHref={href(lang, 'plan')} />
          <RevealObserver />
          {(await isPreview()) && <PreviewBar lang={lang} />}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
