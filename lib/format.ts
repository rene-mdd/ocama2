import type { Locale } from './i18n';
import en from '../messages/en.json';
import es from '../messages/es.json';

/** Dates use Intl with the locale, never string templates (ARCHITECTURE.md, Formatting). */
export function formatDate(lang: Locale, isoDate: string): string {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`));
}

export function validUntilLabel(lang: Locale, isoDate: string): string {
  const template = (lang === 'en' ? en : es).offer.validUntil;
  return template.replace('{date}', formatDate(lang, isoDate));
}
