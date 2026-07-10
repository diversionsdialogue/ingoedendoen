// Genereert deploy/nginx-redirects.conf uit data/redirects.json (voor Ploi/nginx).
// Include dit bestand in het server-block van de site (zie deploy/DEPLOY.md).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const redirects = JSON.parse(readFileSync(path.join(root, 'data', 'redirects.json'), 'utf8'));

const lines = [
  '# 301-redirects van oude WordPress-URL\'s — gegenereerd door scripts/gen-nginx-redirects.mjs',
  '# Include in het server-block: include /home/ploi/<site>/deploy/nginx-redirects.conf;',
  ...redirects.map((r) => `location = ${r.from} { return 301 ${r.to}; }`),
  '# zelfde URL zonder trailing slash → ook redirecten',
  ...redirects.map((r) => `location = ${r.from.replace(/\/$/, '')} { return 301 ${r.to}; }`),
];
mkdirSync(path.join(root, 'deploy'), { recursive: true });
writeFileSync(path.join(root, 'deploy', 'nginx-redirects.conf'), lines.join('\n') + '\n');
console.log(`nginx-redirects.conf geschreven: ${redirects.length} redirects (×2 varianten)`);
