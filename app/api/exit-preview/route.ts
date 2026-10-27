import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { PREVIEW_VERSION_COOKIE } from '@/lib/directus';

/** Leaves draft mode and returns to the page (or home). */
export async function GET(req: Request) {
  (await draftMode()).disable();
  (await cookies()).delete(PREVIEW_VERSION_COOKIE);
  const to = new URL(req.url).searchParams.get('to');
  redirect(to?.startsWith('/') && !to.startsWith('//') ? to : '/');
}
