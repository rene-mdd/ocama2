/**
 * The single place an image reference becomes a URL. Content stores one of:
 *   - a Directus file as `<id>.<ext>` (its name in storage) → `${ASSETS_BASE_URL}/<id>.<ext>`, the
 *     public bucket, so images keep loading while Directus is down; without ASSETS_BASE_URL, or for
 *     a bare `<id>`, → `${DIRECTUS_URL}/assets/<id>`
 *   - a path on this project ("/og/preview_home.jpg") → resolved against NEXT_PUBLIC_SITE_URL when absolute is needed
 *   - an absolute URL (legacy photography still on ocama.com) → unchanged
 * Replacing an image with a Directus upload is therefore a data change only.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ocama.com').replace(/\/$/, '');
const BUCKET = process.env.ASSETS_BASE_URL?.replace(/\/$/, '');
const DIRECTUS_ASSETS = process.env.DIRECTUS_URL ? `${process.env.DIRECTUS_URL.replace(/\/$/, '')}/assets` : '';

const FILE = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(\.[a-z0-9]+)?$/i;

export function isFileId(ref: string): boolean {
  return FILE.test(ref);
}

/** URL for use in the page (site-relative paths stay relative). */
export function assetUrl(ref: string): string {
  const file = FILE.exec(ref);
  if (!file) return ref;
  const [, id, ext] = file;
  if (BUCKET && ext) return `${BUCKET}/${ref}`;
  if (!DIRECTUS_ASSETS) throw new Error(`Image ${ref} is a Directus file but DIRECTUS_URL is not set${ext ? '' : ' (and it has no stored name for ASSETS_BASE_URL)'}`);
  return `${DIRECTUS_ASSETS}/${id}`;
}

/** Absolute URL, for Open Graph and structured data. */
export function absoluteAssetUrl(ref: string): string {
  const url = assetUrl(ref);
  return url.startsWith('/') ? SITE_URL + url : url;
}
