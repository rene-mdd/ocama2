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
| `lib/directus.ts` | Content fetch layer. It reads `content-snapshot/` until Directus exists |
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
npm start & npm run links           # crawl: internal links, switcher and hreflang all resolve
```

## Content scripts

- `npm run extract` regenerates `content-snapshot/` from the export. This is a one-off, so don't run it after the JSON has been hand-edited.
- `npm run utilities` regenerates `styles/utilities.css` from the export's inline styles.

## Not done yet (Directus phase)

- The live Directus fetch in `lib/directus.ts`
- `/api/revalidate` and `/api/preview`
- The redirects consumer, the hourly cron, and image prefetch
- Moving photography to the bucket, then switching `Img` to `next/image`
- A server-side form handler. The inquiry form still composes a mailto.
