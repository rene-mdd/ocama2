'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { resolve } from '@/lib/routes';
import { LanguageSwitcher, type DetailSlugs } from './LanguageSwitcher';

export type NavLink = { key: string; label: string; href: string };

type Props = {
  lang: Locale;
  homeHref: string;
  nav: NavLink[];
  mobileNav: NavLink[];
  menuEyebrow: string;
  bookingUrl: string;
  reserveLabel: string;
  reserveLongLabel: string;
  details: DetailSlugs;
};

/** Header, mobile menu and their behaviours (main.js: header state, mobile menu, active nav). */
export function Header({ lang, homeHref, nav, mobileNav, menuEyebrow, bookingUrl, reserveLabel, reserveLongLabel, details }: Props) {
  const t = useTranslations('header');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const route = resolve(lang, pathname.split('/').filter(Boolean).slice(1));
  const active = route && !route.slug ? route.key : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  // The stylesheet drives the open menu from body.menu-open, as in the export.
  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header id="hdr" className={scrolled ? 'scrolled' : undefined}>
        <Link className="brand" href={homeHref}>
          OCAMA
        </Link>
        <nav className="main" aria-label={t('primaryNav')}>
          {nav.map((n) => (
            <Link key={n.key} href={n.href} data-nav={n.key} className={n.key === active ? 'active' : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="d-flex ai-center gap-1">
          <LanguageSwitcher lang={lang} details={details} />
          <a className="btn" href={bookingUrl}>
            {reserveLabel}
          </a>
          <button
            className="burger"
            id="burger"
            aria-label={t('openMenu')}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className="mobile-menu" id="mmenu">
        <div className="mm-eyebrow">{menuEyebrow}</div>
        {mobileNav.map((n) => (
          <Link key={n.key} href={n.href} onClick={close}>
            {n.label}
          </Link>
        ))}
        <a className="btn" href={bookingUrl} onClick={close}>
          {reserveLongLabel}
        </a>
      </div>
    </>
  );
}
