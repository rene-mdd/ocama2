import type { PageKey } from '../routes';

/** Fixed pages rendered by the catch-all route (home has its own route file). */
export const fixedPages = [
  'about', 'stay', 'dining', 'wellness', 'experiences', 'hospitality', 'sustainability', 'offers', 'plan', 'press',
] as const satisfies readonly PageKey[];
