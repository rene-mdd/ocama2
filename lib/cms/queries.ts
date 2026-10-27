/** Directus queries, shared by the site's fetch layer and scripts/pull-snapshot.ts. */
const filter = (f: unknown) => `&filter=${encodeURIComponent(JSON.stringify(f))}`;
const PUBLISHED = { status: { _eq: 'published' } };
const SCHEDULED = { _or: [{ publish_at: { _null: true } }, { publish_at: { _lte: '$NOW' } }] };

export const queries = {
  site: () => '/items/site_settings?fields=*.*',
  villas: (draft = false) => `/items/villas?fields=*.*,related.related_villas_id.key&sort=sort&limit=-1${draft ? '' : filter(PUBLISHED)}`,
  offers: (draft = false) => `/items/offers?fields=*,translations.*&sort=sort&limit=-1${draft ? '' : filter({ _and: [PUBLISHED, SCHEDULED] })}`,
  page: (key: string) => `/items/page_${key}?fields=*.*`,
  redirects: () => '/items/redirects?fields=from,to,note&sort=from&limit=-1',
};
