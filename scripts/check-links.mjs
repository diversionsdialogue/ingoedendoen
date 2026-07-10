/**
 * Dode-linkcheck over de gebouwde site (site/dist).
 * - Interne links: elk href/src moet naar een bestaand bestand, redirect of directory-index wijzen.
 * - Externe links: per uniek domein één HEAD/GET-check (best effort).
 *
 * Gebruik: node scripts/check-links.mjs [--extern]
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'site', 'dist');
const checkExternal = process.argv.includes('--extern');

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (name.endsWith('.html')) yield p;
  }
}

const internalBroken = [];
const external = new Map(); // url → [pagina's]
let checkedLinks = 0;

function internalExists(url) {
  const clean = decodeURI(url.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return true;
  const rel = clean.replace(/^\//, '');
  const candidates = [
    path.join(dist, rel),
    path.join(dist, rel, 'index.html'),
    path.join(dist, rel.replace(/\/$/, '') + '.html'),
  ];
  return candidates.some((c) => existsSync(c));
}

for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, 'utf8');
  const page = '/' + path.relative(dist, file).replace(/\\/g, '/').replace(/index\.html$/, '');
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    checkedLinks++;
    if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#') || url.startsWith('data:')) continue;
    if (url.includes('${')) continue; // template literal in inline script, geen echte link
    if (url.startsWith('//')) continue; // protocol-relatief = extern
    if (/^https?:\/\//.test(url)) {
      if (/(^|\.)ingoedendoen\.nl/.test(new URL(url).host)) {
        if (!internalExists(new URL(url).pathname)) internalBroken.push({ page, url });
      } else if (checkExternal) {
        if (!external.has(url)) external.set(url, []);
        external.get(url).push(page);
      }
      continue;
    }
    if (!internalExists(url)) internalBroken.push({ page, url });
  }
}

console.log(`gecheckte verwijzingen: ${checkedLinks}`);
console.log(`interne dode links: ${internalBroken.length}`);
for (const b of internalBroken.slice(0, 40)) console.log(`  ${b.page} → ${b.url}`);

if (checkExternal) {
  // Check per domein (één URL per domein om servers te ontzien)
  const byDomain = new Map();
  for (const [url, pages] of external) {
    const d = new URL(url).host;
    if (!byDomain.has(d)) byDomain.set(d, { url, pages, count: 0 });
    byDomain.get(d).count += pages.length;
  }
  console.log(`externe domeinen te checken: ${byDomain.size}`);
  const dead = [];
  const items = [...byDomain.entries()];
  const CONC = 10;
  for (let i = 0; i < items.length; i += CONC) {
    await Promise.all(items.slice(i, i + CONC).map(async ([domain, info]) => {
      try {
        let res = await fetch(info.url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Mozilla/5.0 (linkcheck ingoedendoen.nl)' } });
        if (res.status === 405 || res.status === 403 || res.status === 404) {
          res = await fetch(info.url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 (linkcheck ingoedendoen.nl)' } });
        }
        if (res.status >= 400) dead.push({ domain, url: info.url, status: res.status, links: info.count });
      } catch (e) {
        dead.push({ domain, url: info.url, error: String(e.cause?.code || e.message).slice(0, 60), links: info.count });
      }
    }));
  }
  dead.sort((a, b) => b.links - a.links);
  console.log(`dode/onbereikbare externe domeinen: ${dead.length}`);
  for (const d of dead) console.log(`  ${d.domain} (${d.links} links) → ${d.status || d.error}`);
  const { writeFileSync } = await import('node:fs');
  writeFileSync(path.join(root, 'data', 'dead-external-domains.json'), JSON.stringify(dead, null, 1));
}

if (internalBroken.length > 0) process.exitCode = 1;
