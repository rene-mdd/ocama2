/**
 * Directus rows → the site's content types (lib/types.ts). Pure functions, no Next.js imports,
 * so scripts (pull-snapshot) can use them too. Reverses the conventions of
 * ../hotel-cms/scripts/generate-schema.mjs:
 *   - columns `a__b`                    → nested { a: { b } }
 *   - `list` rows of { value }          → string[]
 *   - many-to-many file junction rows   → file ids, in `sort` order
 *   - file fields expanded by fields=*.* → their id
 */
import type { ImageRef, Offer, Page, SiteSettings, Villa } from '../types';

export type Row = Record<string, unknown>;

const PARENT_SYSTEM = new Set(['id', 'key', 'translations', 'date_updated', 'date_created', 'user_created', 'user_updated', 'sort', 'status']);
const TRANSLATION_SYSTEM = new Set(['id', 'languages_code']);
const SEO_KEYS = ['meta_title', 'meta_description', 'og_title', 'og_description', 'og_image_alt'] as const;

const isObj = (v: unknown): v is Row => !!v && typeof v === 'object' && !Array.isArray(v);

/** JSON columns arrive as strings on SQLite; Postgres returns them parsed. */
function parseJson(v: unknown): unknown {
  if (typeof v !== 'string' || !/^\s*[[{]/.test(v)) return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

/** A file field: id string, or the expanded file object. */
function fileId(v: unknown): string | null {
  if (typeof v === 'string') return v;
  if (isObj(v) && typeof v.id === 'string') return v.id;
  return null;
}

function normalise(raw: unknown): unknown {
  const v = parseJson(raw);
  if (!Array.isArray(v)) return isObj(v) && 'filename_download' in v ? fileId(v) : v;
  // many-to-many junction rows: { directus_files_id, sort } or { related_<x>_id: { key }, sort }
  if (v.length && v.every((r) => isObj(r) && 'sort' in r && Object.keys(r).some((k) => k.endsWith('_id') && k !== 'id'))) {
    const sorted = [...(v as Row[])].sort((a, b) => Number(a.sort ?? 0) - Number(b.sort ?? 0));
    if (sorted.every((r) => 'directus_files_id' in r)) return sorted.map((r) => fileId(r.directus_files_id)).filter(Boolean);
    const relKey = Object.keys(sorted[0]).find((k) => k.startsWith('related_'));
    if (relKey) return sorted.map((r) => (isObj(r[relKey]) ? (r[relKey] as Row).key : r[relKey]));
  }
  // `list` of a single `value` field → plain strings
  if (v.length && v.every((r) => isObj(r) && Object.keys(r).length === 1 && 'value' in r)) return (v as Row[]).map((r) => r.value);
  return v;
}

/** An object whose leaves are all null was an optional block (e.g. a villa without a quote). */
function nullIfEmpty(v: unknown): unknown {
  if (!isObj(v)) return v;
  const out = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, nullIfEmpty(x)]));
  return Object.values(out).every((x) => x === null) ? null : out;
}

/** Flat Directus columns → nested object (`a__b` paths). */
export function unflatten(row: Row, skip: Set<string>): Row {
  const out: Row = {};
  for (const [key, raw] of Object.entries(row)) {
    if (skip.has(key) || key.endsWith('_id')) continue;
    const parts = key.split('__');
    let node = out;
    for (const p of parts.slice(0, -1)) node = (node[p] ??= {}) as Row;
    node[parts.at(-1)!] = normalise(raw);
  }
  for (const k of Object.keys(out)) if (isObj(out[k])) out[k] = nullIfEmpty(out[k]);
  return out;
}

const translations = <T>(row: Row, map: (t: Row) => T): (T & { languages_code: string })[] =>
  ((row.translations as Row[] | undefined) ?? []).map((t) => ({ ...map(t), languages_code: String(t.languages_code) }));

const seo = (t: Row) => Object.fromEntries(SEO_KEYS.map((k) => [k, (t[k] as string | null | undefined) ?? null]));

export function mapSiteSettings(row: Row): SiteSettings {
  return {
    ...(unflatten(row, PARENT_SYSTEM) as unknown as Omit<SiteSettings, 'translations'>),
    og_image: fileId(row.og_image) ?? '',
    translations: translations(row, (t) => unflatten(t, TRANSLATION_SYSTEM)),
  } as SiteSettings;
}

export function mapVilla(row: Row, fallbackImage: string): Villa {
  const p = unflatten(row, PARENT_SYSTEM);
  const img = (v: unknown): ImageRef => ({ src: fileId(v) ?? fallbackImage });
  return {
    id: String(row.key),
    sort: Number(row.sort ?? 0),
    status: row.status as Villa['status'],
    header_image: img(p.header_image),
    intro_image: img(p.intro_image),
    gallery: ((p.gallery as string[] | undefined) ?? []).map((src) => ({ src })),
    booking_url: String(p.booking_url ?? ''),
    og_image: fileId(p.og_image),
    related: (p.related as string[] | undefined) ?? [],
    translations: translations(row, (t) => ({ ...unflatten(t, TRANSLATION_SYSTEM), ...seo(t) })),
  } as Villa;
}

/** Card lists whose images live on the parent: their lengths must match, or the build fails. */
const ALIGNED: Record<string, [image: string, section: string][]> = {
  home: [['villa_cards', 'villas.cards'], ['experience_cards', 'experiences.cards']],
  stay: [['villa_cards', 'cards']],
  wellness: [['cards', 'cards']],
};

export function mapPage(key: string, row: Row): Page {
  const { og_image, ...images } = unflatten(row, PARENT_SYSTEM);
  const page = {
    key,
    status: 'published',
    date_updated: String(row.date_updated ?? ''),
    og_image: fileId(og_image),
    images,
    translations: translations(row, (t) => {
      const { title, ...rest } = unflatten(t, new Set([...TRANSLATION_SYSTEM, ...SEO_KEYS]));
      return { title: String(title ?? ''), ...seo(t), sections: rest };
    }),
  } as Page;
  for (const [imageField, sectionPath] of ALIGNED[key] ?? []) {
    const imgs = (images as Row)[imageField] as unknown[] | undefined;
    for (const t of page.translations) {
      const cards = sectionPath.split('.').reduce<unknown>((o, k) => (isObj(o) ? o[k] : undefined), t.sections) as unknown[] | undefined;
      if ((imgs?.length ?? 0) !== (cards?.length ?? 0)) {
        throw new Error(`page ${key}: ${imgs?.length ?? 0} images in "${imageField}" but ${cards?.length ?? 0} cards in "${sectionPath}" (${t.languages_code})`);
      }
    }
  }
  return page;
}

export function mapOffer(row: Row, fallbackImage: string): Offer {
  const json = <T>(v: unknown, fallback: T): T => (v == null ? fallback : (parseJson(v) as T));
  return {
    ...(row as unknown as Offer),
    id: String(row.key ?? row.id),
    // An offer saved without a banner shows the site share image rather than failing to render.
    image: { src: fileId(row.image) ?? fallbackImage },
    og_image: fileId(row.og_image),
    noindex: Boolean(row.noindex),
    price: row.price == null ? null : Number(row.price),
    translations: translations(row, (raw) => {
      const t = raw as unknown as Offer['translations'][number];
      return {
        ...t,
        ...seo(raw),
        inclusions: json<string[]>(t.inclusions, []),
        details: json<Offer['translations'][number]['details']>(t.details, []),
        terms_note: t.terms_note ?? null,
      };
    }),
  };
}
