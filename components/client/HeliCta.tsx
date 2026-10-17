'use client';
import { useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';

/** main.js helicopter CTA: adds a note to the inquiry form and scrolls to it. */
export function HeliCta({ href, label }: { href: string; label: string }) {
  const t = useTranslations('plan');
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const n = document.getElementById('f-notes') as HTMLTextAreaElement | null;
    if (!n) return;
    if (!n.value.includes(t('heliMarker'))) n.value = (n.value ? n.value + '\n' : '') + t('heliNote');
    document.getElementById('plan-grid')?.scrollIntoView({ behavior: 'smooth' });
    n.focus({ preventScroll: true });
  };
  return (
    <a className="btn" id="heli-cta" href={href} onClick={onClick}>
      {label}
    </a>
  );
}
