@AGENTS.md

# hotel-web

Next.js App Router frontend for the Ocama site. Design: ../ARCHITECTURE.md. Deployment: ../DEPLOYMENT.md.
The approved design is the static export in ../ocama-2.0-export; this app must stay faithful to it.

## Current phase: snapshot only
Directus is not stood up yet. All content comes from `content-snapshot/` (JSON shaped like the
Directus collections), read through `lib/directus.ts`. The snapshot was generated from the export
by `npm run extract`; once content is edited in JSON directly, don't re-run the full extract.

## Rules
- Every content page is statically generated. Never fetch content in a client component or at request time.
- Planned runtime routes are only /api/revalidate and /api/preview. Do not add others.
- Never set output: 'export'. It breaks draft preview and revalidation.
- The fetch layer throws on empty data. Do not add fallbacks that return [] on error; a failed build is correct.
- All user-facing text is translated. UI micro-copy lives in messages/*.json; content in content-snapshot translations.
- Internal links are built with `href(lang, key, slug)` from lib/routes.ts. Never hardcode paths.
- No localStorage for content. No client-side CMS calls.

## Styling
- styles/export.css is the export stylesheet (fonts swapped to next/font variables). Don't restyle it.
- Inline styles from the export became generated utilities in styles/utilities.css
  (`npx tsx scripts/utilities.ts "<style>"` prints the classes). Additions go in styles/site.css.

## Checks
- `npm run build && npm run parity` compares every built page with the export (text + structure).
- `npm run lint`, `npm run typecheck`, `npm run links` (needs `npm start` running).
