# hotel-web

The Ocama 2.0 site on Next.js (App Router), deployed to Vercel. The architecture is in
`../ARCHITECTURE.md`, and the approved design reference is the static export in `../ocama-2.0-export`.

## Run

```bash
npm install
npm run dev            # http://localhost:3000 → /en
npm run build && npm start
```

Copy `.env.example` to `.env.local` to override `NEXT_PUBLIC_SITE_URL`.

## How it is put together

| Path | What it holds |
| --- | --- |
| `app/[lang]/layout.tsx` | `<html lang>`, header, mobile menu, footer, Hotel JSON-LD |
| `app/[lang]/page.tsx` | Home page |
| `app/[lang]/[...segments]/page.tsx` | Every other page, with localized segments resolved by `lib/routes.ts` |
| `lib/routes.ts` | Segment map (`/en/stay` ↔ `/es/estadia`) and `href()`, used for every internal link |
| `lib/directus.ts`, `lib/cms/` | Content fetch layer: Directus (cached, tagged, draft-aware), with `content-snapshot/` as the fallback |
| `lib/seo.ts`, `lib/assets.ts` | Metadata with fallbacks; the one place image references become URLs |
| `lib/legacy-redirects.ts` | Old ocama.com URL list and the redirect builder (chains collapsed, single hop) |
| `app/api/revalidate` | Called by the Directus Flow on save; refreshes what that collection feeds |
| `app/api/preview`, `exit-preview` | Directus Preview URL target: draft mode, drafts and content versions, noindex |
| `content-snapshot/` | Content shaped like the Directus collections: `site_settings`, `villas`, `offers`, `pages/<key>` |
| `messages/{en,es}.json` | UI micro-copy (aria labels, mailto templates, map popups) via next-intl |
| `components/templates/` | One template per page type |
| `styles/` | The export stylesheet as is, generated utilities, and the few additions |

### URLs

Both languages are prefixed, and Spanish uses translated segments:

- `/en/stay/casa-bagua` ↔ `/es/estadia/casa-bagua`
- `/en/offers/a-taste-of-ocama` ↔ `/es/ofertas/un-sabor-de-ocama`
- `/en/plan-your-stay` ↔ `/es/planifique-su-estadia`

`/` redirects to `/en`. The language is never chosen from the browser.

## Checks

```bash
npm run typecheck && npm run lint
npm run build && npm run parity     # every page vs the export: text + element structure
npm run seo                         # every page's <head>: required tags, duplicates, no old WordPress URLs
npm start & npm run links           # crawl: internal links, switcher and hreflang all resolve
```

## Content scripts

- `npm run extract` regenerates `content-snapshot/` from the export. This is a one-off, so don't run it after the JSON has been hand-edited.
- `npm run utilities` regenerates `styles/utilities.css` from the export's inline styles.

## SEO

Titles, descriptions, share titles/descriptions and share images come from the old live site
(`../ocama`), with Spanish translations; see `scripts/extract/legacy-seo.ts` for the mapping and the
corrections made. Share images are in `public/og/` until they're uploaded to Directus. Offer SEO is
editable in Directus under **Search & sharing** (schema and seed in `../hotel-cms`).

## Directus

Run the CMS locally from `../hotel-cms` (see its README), then:

```bash
DIRECTUS_URL=http://localhost:8055 DIRECTUS_BUILD_TOKEN=… DIRECTUS_PREVIEW_TOKEN=… \
REVALIDATE_SECRET=… PREVIEW_SECRET=… npm run build && npm start
PARITY_IGNORE_IMG_SRC=1 npm run parity   # images are now Directus file URLs
npm run snapshot                         # refresh content-snapshot/ from Directus, then commit
```

## Not done yet

- A server-side handler for the inquiry form (it still composes a mailto)
- `next/image`, once images are served from the bucket (`ASSETS_BASE_URL`)
