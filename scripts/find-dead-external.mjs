/**
 * Controleert alle externe links in de content op de eerder geflagde probleem-domeinen
 * en schrijft data/dead-links.json met URL's die aantoonbaar dood zijn
 * (DNS-fout, TLS-fout, 404/410). 403 wordt als botblokkade beschouwd en blijft staan.
 * convert.mjs unwrapt deze links daarna.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const content = JSON.parse(readFileSync(path.join(root, 'data', 'content.json'), 'utf8'));
const flagged = JSON.parse(readFileSync(path.join(root, 'data', 'dead-external-domains.json'), 'utf8'));
const flaggedDomains = new Set(flagged.map((d) => d.domain));

const urls = new Map(); // url → aantal
for (const e of content.entries) {
  for (const m of e.body.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    try {
      const host = new URL(m[1]).host;
      if (flaggedDomains.has(host)) urls.set(m[1], (urls.get(m[1]) || 0) + 1);
    } catch {}
  }
}
console.log('te checken URLs op probleem-domeinen:', urls.size);

const dead = [];
const items = [...urls.keys()];
const CONC = 10;
for (let i = 0; i < items.length; i += CONC) {
  await Promise.all(items.slice(i, i + CONC).map(async (url) => {
    try {
      const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
      if (res.status === 404 || res.status === 410) dead.push({ url, status: res.status });
    } catch (e) {
      const code = String(e.cause?.code || e.message);
      if (/ENOTFOUND|CERT|EAI_AGAIN|TIMEOUT|ECONNREFUSED/i.test(code)) dead.push({ url, error: code.slice(0, 50) });
    }
  }));
}
console.log('aantoonbaar dode externe links:', dead.length);
for (const d of dead) console.log(' ', d.url, '→', d.status || d.error);
writeFileSync(path.join(root, 'data', 'dead-links.json'), JSON.stringify(dead.map((d) => d.url), null, 1));
