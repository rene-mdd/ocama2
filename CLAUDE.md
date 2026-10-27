@AGENTS.md

# hotel-web

Next.js App Router frontend for the Ocama site. Design: ../ARCHITECTURE.md. Deployment: ../DEPLOYMENT.md.
The approved design is the static export in ../ocama-2.0-export; this app must stay faithful to it.

## Content source
All content comes from Directus (../hotel-cms) when DIRECTUS_URL + DIRECTUS_BUILD_TOKEN are set,
through `lib/directus.ts` (fetch, tags, draft mode) and `lib/cms/map.ts` (Directus rows → lib/types.ts).
If Directus is unreachable, `content-snapshot/` is used (refresh it with `npm run snapshot`).
Without Directus configured, the snapshot only. The Directus schema is generated from the snapshot's
shapes (../hotel-cms/scripts/generate-schema.mjs): change content types here first, then regenerate.

## Rules
- Every content page is statically generated. Never fetch content in a client component or at request time.
- Runtime routes are only /api/revalidate, /api/preview and /api/exit-preview. Do not add others.
- Never set output: 'export'. It breaks draft preview and revalidation.
- The fetch layer throws on empty data. Do not add fallbacks that return [] on error; a failed build is correct.
- All user-facing text is translated. UI micro-copy lives in messages/*.json; content in content-snapshot translations.
- Internal links are built with `href(lang, key, slug)` from lib/routes.ts. Never hardcode paths.
- No localStorage for content. No client-side CMS calls.
- Every image reference goes through lib/assets.ts (Directus file id, site path or URL). Never build asset URLs by hand.
- SEO fields (meta_title, meta_description, og_title, og_description, og_image_alt, og_image) are content;
  buildMetadata() in lib/seo.ts owns the fallbacks. Redirects come from the Directus `redirects`
  collection (fallback content-snapshot/redirects.json), applied by next.config.ts at build.

## Styling
- styles/export.css is the export stylesheet (fonts swapped to next/font variables). Don't restyle it.
- Inline styles from the export became generated utilities in styles/utilities.css
  (`npx tsx scripts/utilities.ts "<style>"` prints the classes). Additions go in styles/site.css.

## Checks
- `npm run build && npm run parity` compares every built page with the export (text + structure).
- `npm run seo` checks every built page's head (missing tags, duplicates, old WordPress URLs).
- `npm run lint`, `npm run typecheck`, `npm run links` (needs `npm start` running).
