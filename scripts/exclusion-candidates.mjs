// Bepaal kandidaten voor uitsluiting: gepubliceerde posts zonder GSC-zichtbaarheid, oud, of promotioneel.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventory = JSON.parse(readFileSync(path.join(root, 'data', 'wxr-inventory.json'), 'utf8'));
const gsc = JSON.parse(readFileSync(path.join(root, 'data', 'gsc-pages.json'), 'utf8'));

const gscByPath = new Map(gsc.map((r) => [new URL(r.url).pathname.replace(/\/$/, ''), r]));

const posts = inventory.filter((p) => p.type === 'post' && p.status === 'publish');

// Per jaar
const byYear = {};
for (const p of posts) byYear[p.date.slice(0, 4)] = (byYear[p.date.slice(0, 4)] || 0) + 1;
console.log('posts per jaar:', JSON.stringify(byYear));

const PROMO = /actie|winactie|win een |korting|aanbieding|webinar|black friday|sale|e-?book|weggeef/i;

const candidates = [];
let keptOld = 0;
for (const p of posts) {
  const pathName = new URL(p.link).pathname.replace(/\/$/, '');
  const g = gscByPath.get(pathName);
  const year = +p.date.slice(0, 4);
  const impressions = g ? g.impr : 0;
  const clicks = g ? g.clicks : 0;
  const promo = PROMO.test(p.title) || PROMO.test(p.slug);
  const yearInTitle = p.title.match(/20(1[0-9]|2[0-2])/); // jaartal t/m 2022 in titel
  let reason = null;
  if (promo) reason = 'promotioneel/actie';
  else if (yearInTitle) reason = `gedateerd jaartal in titel (${yearInTitle[0]})`;
  else if (year < 2016 && impressions === 0) reason = 'oud (<2016) en onzichtbaar in GSC';
  if (reason) candidates.push({ id: p.id, slug: p.slug, title: p.title, date: p.date.slice(0, 10), link: p.link, impressions, clicks, reason, cats: p.cats.filter((c) => c.domain === 'category').map((c) => c.slug) });
  else if (year < 2016) keptOld++;
}
console.log('kandidaten:', candidates.length, '— oude posts behouden (GSC-zichtbaar):', keptOld);
console.log('per reden:', JSON.stringify(candidates.reduce((a, c) => ((a[c.reason.split(' (')[0]] = (a[c.reason.split(' (')[0]] || 0) + 1), a), {})));
writeFileSync(path.join(root, 'data', 'exclusion-candidates.json'), JSON.stringify(candidates, null, 1));
for (const c of candidates.slice(0, 60)) console.log(`${c.date} [${c.reason}] ${c.title} (impr:${c.impressions})`);
