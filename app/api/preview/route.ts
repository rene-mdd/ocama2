import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { PREVIEW_VERSION_COOKIE, previewPath } from '@/lib/directus';
import { isLocale } from '@/lib/i18n';
import { href, type PageKey } from '@/lib/routes';

/**
 * Directus Preview URL target (ARCHITECTURE.md, Draft preview):
 *   /api/preview?secret=…&collection=offers|villas|page&key=<key>[&lang=es][&version=<content version>]
 * Enables draft mode (preview token, drafts included, uncached) and redirects to the page.
 */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  if (!process.env.PREVIEW_SECRET || params.get('secret') !== process.env.PREVIEW_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  const langParam = params.get('lang') ?? 'en';
  const lang = isLocale(langParam) ? langParam : 'en';
  const target = await previewPath(params.get('collection') ?? '', params.get('key') ?? '', lang);
  if (!target) return new Response('Unknown item', { status: 404 });

  (await draftMode()).enable();
  // Directus fills {{$version}} with the content version being edited; "main" means the live item.
  const version = params.get('version');
  const jar = await cookies();
  const collection = params.get('collection') === 'page' ? `page_${params.get('key')}` : params.get('collection');
  if (version && version !== 'main' && !version.includes('{{')) {
    // Scoped to the item's collection: other pages browsed during preview show their live content.
    jar.set(PREVIEW_VERSION_COOKIE, `${collection}:${version}`, { httpOnly: true, sameSite: 'none', secure: true, path: '/' });
  } else {
    jar.delete(PREVIEW_VERSION_COOKIE);
  }
  redirect(href(lang, target.pageKey as PageKey, target.slug));
}
