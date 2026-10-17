export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/** Directus `languages.code` for each URL locale. */
export const languageCodes = { en: 'en-US', es: 'es-ES' } as const satisfies Record<Locale, string>;
export type LanguageCode = (typeof languageCodes)[Locale];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
