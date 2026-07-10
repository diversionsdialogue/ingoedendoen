import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const xml = readFileSync(path.join(root, 'ingoedendoen.WordPress.2026-07-09.xml'), 'utf8');

// Categoriehiërarchie
const cats = [...xml.matchAll(/<wp:category>([\s\S]*?)<\/wp:category>/g)].map((m) => {
  const t = (n) => {
    const mm = m[1].match(new RegExp(`<wp:${n}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></wp:${n}>`));
    return mm ? mm[1] : '';
  };
  return { slug: t('category_nicename'), parent: t('category_parent'), name: t('cat_name') };
});
console.log('CATEGORIES:', JSON.stringify(cats, null, 0));

const items = xml.split('<item>').slice(1).map((c) => c.split('</item>')[0]);
const tag = (src, name) => {
  const m = src.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`));
  return m ? m[1] : '';
};

const want = process.argv[2] ? process.argv.slice(2) : ['gezonde-hartslag-hartslag-tabel', 'trombosebeen-van-oorzaak-tot-gevolg', 'wenkbrauwen-te-donker'];
for (const slug of want) {
  const it = items.find((s) => tag(s, 'wp:post_name') === slug);
  if (!it) { console.log('NOT FOUND:', slug); continue; }
  console.log('\n===== ', slug, ' type:', tag(it, 'wp:post_type'), ' link:', tag(it, 'link'));
  console.log(tag(it, 'content:encoded').slice(0, 3500));
}
