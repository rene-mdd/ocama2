/**
 * The single place an image reference becomes a URL. Content stores one of:
 *   - a Directus file id (UUID)  → `${ASSETS_BASE_URL}/<id>` (public bucket), else `${DIRECTUS_URL}/assets/<id>`
 *   - a path on this project ("/og/preview_home.jpg") → resolved against NEXT_PUBLIC_SITE_URL when absolute is needed
 *   - an absolute URL (legacy photography still on ocama.com) → unchanged
 * Replacing an image with a Directus upload is therefore a data change only.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ocama.com').replace(/\/$/, '');
const ASSETS_BASE = (
  process.env.ASSETS_BASE_URL ?? (process.env.DIRECTUS_URL ? `${process.env.DIRECTUS_URL.replace(/\/$/, '')}/assets` : '')
).replace(/\/$/, '');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isFileId(ref: string): boolean {
  return UUID.test(ref);
}

/** URL for use in the page (site-relative paths stay relative). */
export function assetUrl(ref: string): string {
  if (isFileId(ref)) {
    if (!ASSETS_BASE) throw new Error(`Image ${ref} is a Directus file id but neither ASSETS_BASE_URL nor DIRECTUS_URL is set`);
    return `${ASSETS_BASE}/${ref}`;
  }
  return ref;
}

/** Absolute URL, for Open Graph and structured data. */
export function absoluteAssetUrl(ref: string): string {
  const url = assetUrl(ref);
  return url.startsWith('/') ? SITE_URL + url : url;
}
