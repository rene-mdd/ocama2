import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/i18n';

/** Shown only in draft mode (/api/preview): says so, and offers a way out. */
export async function PreviewBar({ lang }: { lang: Locale }) {
  const t = await getTranslations({ locale: lang, namespace: 'preview' });
  return (
    <div className="preview-bar" role="status">
      {t('label')} ·{' '}
      {/* A plain link on purpose: <Link> would prefetch the route and leave preview by itself. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/api/exit-preview">{t('exit')}</a>
    </div>
  );
}
