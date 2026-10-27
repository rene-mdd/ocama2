import { revalidateTag } from 'next/cache';
import { TAGS } from '@/lib/directus';

/** Directus collection → the cache tag of everything rendered from it. */
function tagFor(collection: string): string | null {
  const parent = collection.replace(/_(translations|gallery|related|villa_cards|experience_cards|cards)$/, '');
  if (parent === 'site_settings') return TAGS.site;
  if (parent === 'villas') return TAGS.villas;
  if (parent === 'offers') return TAGS.offers;
  if (parent.startsWith('page_')) return TAGS.pages;
  return null;
}

/**
 * Called by the Directus Flow "Revalidate website" when content is saved (ARCHITECTURE.md,
 * Publishing pipeline). Expires every page that read that collection; site settings and villas
 * also feed the layout, so those refresh the whole site. `expire: 0` means the next visit
 * renders fresh data; with stale-while-revalidate a newly published offer's first visit would
 * render (and cache) a 404 from the old list.
 *   POST { "secret": REVALIDATE_SECRET, "collection": "<directus collection>" }
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { secret?: string; collection?: string } | null;
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || body?.secret !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }
  const tag = tagFor(body.collection ?? 'offers');
  if (!tag) {
    return Response.json({ revalidated: false, message: `Unsupported collection: ${body.collection}` }, { status: 400 });
  }
  revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: true, tag, now: Date.now() });
}
