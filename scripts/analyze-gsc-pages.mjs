import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'search-console');
const file = readdirSync(dir).find((f) => f.startsWith('Pagina'));
const csv = readFileSync(path.join(dir, file), 'utf8').split(/\r?\n/).filter(Boolean);

const rows = csv
  .slice(1)
  .map((l) => {
    const m = l.match(/^(.*?),(\d+),(\d+),([\d.,]+)%,([\d.,]+)$/);
    return m ? { url: m[1], clicks: +m[2], impr: +m[3], ctr: parseFloat(m[4].replace(',', '.')), pos: parseFloat(m[5].replace(',', '.')) } : null;
  })
  .filter(Boolean);

console.log('rows:', rows.length);
console.log('total clicks:', rows.reduce((a, r) => a + r.clicks, 0), 'impr:', rows.reduce((a, r) => a + r.impr, 0));

const pat = {};
for (const r of rows) {
  const p = new URL(r.url).pathname.split('/').filter(Boolean);
  const key = p.length ? p[0] : '(home)';
  pat[key] = pat[key] || { n: 0, clicks: 0, impr: 0 };
  pat[key].n++;
  pat[key].clicks += r.clicks;
  pat[key].impr += r.impr;
}
console.log(JSON.stringify(Object.fromEntries(Object.entries(pat).sort((a, b) => b[1].impr - a[1].impr)), null, 1));
writeFileSync(path.join(root, 'data', 'gsc-pages.json'), JSON.stringify(rows, null, 1));
console.log('top 25 by clicks:');
for (const r of [...rows].sort((a, b) => b.clicks - a.clicks).slice(0, 25)) console.log(r.clicks, r.impr, r.url);
