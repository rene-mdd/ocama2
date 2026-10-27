// Writes content-snapshot/redirects.json from lib/legacy-redirects.ts (the old ocama.com URLs).
// It is both the redirects fallback when Directus is unreachable and the seed for the
// Directus `redirects` collection.   npx tsx scripts/export-redirects.ts
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { legacyRedirectList } from '../lib/legacy-redirects';

const rows = legacyRedirectList();
writeFileSync(path.resolve(import.meta.dirname, '../content-snapshot/redirects.json'), JSON.stringify(rows, null, 2) + '\n');
console.log(`content-snapshot/redirects.json: ${rows.length} redirects`);
