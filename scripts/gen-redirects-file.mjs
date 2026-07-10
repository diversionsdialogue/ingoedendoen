// Genereert site/public/_redirects (Netlify-formaat, ook door veel andere hosts ondersteund)
// zodat oude URL's server-side 301'en. De meta-refresh-stubs van Astro blijven de fallback.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const redirects = JSON.parse(readFileSync(path.join(root, 'data', 'redirects.json'), 'utf8'));
const lines = redirects.map((r) => `${r.from} ${r.to} 301`);
writeFileSync(path.join(root, 'site', 'public', '_redirects'), lines.join('\n') + '\n');
console.log(`_redirects geschreven: ${lines.length} regels`);
