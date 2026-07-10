// Analyse van de WordPress WXR-export: inventaris van content en Beaver Builder-gebruik.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const xml = readFileSync(path.join(root, 'ingoedendoen.WordPress.2026-07-09.xml'), 'utf8');

const items = xml.split('<item>').slice(1).map((chunk) => chunk.split('</item>')[0]);

function tag(src, name) {
  const m = src.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`));
  return m ? m[1] : '';
}
function metas(src) {
  const out = {};
  const re = /<wp:postmeta>\s*<wp:meta_key><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>\s*<\/wp:postmeta>/g;
  let m;
  while ((m = re.exec(src))) out[m[1]] = m[2];
  return out;
}
function cats(src) {
  const out = [];
  const re = /<category domain="([^"]+)" nicename="([^"]+)"><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g;
  let m;
  while ((m = re.exec(src))) out.push({ domain: m[1], slug: m[2], name: m[3] });
  return out;
}

const parsed = items.map((src) => {
  const meta = metas(src);
  return {
    id: tag(src, 'wp:post_id'),
    title: tag(src, 'title'),
    link: tag(src, 'link'),
    type: tag(src, 'wp:post_type'),
    status: tag(src, 'wp:status'),
    slug: tag(src, 'wp:post_name'),
    date: tag(src, 'wp:post_date'),
    parent: tag(src, 'wp:post_parent'),
    contentLen: tag(src, 'content:encoded').length,
    content: tag(src, 'content:encoded'),
    flEnabled: meta._fl_builder_enabled === '1',
    hasFlData: '_fl_builder_data' in meta,
    metaKeys: Object.keys(meta),
    cats: cats(src),
  };
});

const posts = parsed.filter((p) => p.type === 'post');
const pages = parsed.filter((p) => p.type === 'page');

const summary = {
  posts: { total: posts.length, publish: posts.filter((p) => p.status === 'publish').length, draft: posts.filter((p) => p.status === 'draft').length, flBuilder: posts.filter((p) => p.flEnabled).length },
  pages: { total: pages.length, publish: pages.filter((p) => p.status === 'publish').length, flBuilder: pages.filter((p) => p.flEnabled).length },
};
console.log(JSON.stringify(summary, null, 2));

// Categorieën over gepubliceerde posts
const catCount = {};
for (const p of posts.filter((x) => x.status === 'publish')) {
  for (const c of p.cats.filter((c) => c.domain === 'category')) catCount[c.slug] = (catCount[c.slug] || 0) + 1;
}
console.log('categories:', JSON.stringify(catCount, null, 2));

// Voorbeelden van permalinks
console.log('post links sample:', posts.filter((p) => p.status === 'publish').slice(0, 5).map((p) => p.link));
console.log('page links sample:', pages.filter((p) => p.status === 'publish').slice(0, 40).map((p) => `${p.link} [fl:${p.flEnabled ? 1 : 0}]`));

// Shortcodes in published post content
const shortcodes = {};
for (const p of [...posts, ...pages].filter((x) => x.status === 'publish')) {
  for (const m of p.content.matchAll(/\[([a-zA-Z0-9_-]+)[ \]]/g)) shortcodes[m[1]] = (shortcodes[m[1]] || 0) + 1;
}
console.log('shortcodes:', JSON.stringify(shortcodes, null, 2));

// Datumbereik posts
const dates = posts.filter((p) => p.status === 'publish').map((p) => p.date).sort();
console.log('date range:', dates[0], '→', dates[dates.length - 1]);

writeFileSync(path.join(root, 'data', 'wxr-inventory.json'), JSON.stringify(parsed.map(({ content, ...rest }) => rest), null, 1));
console.log('inventory written');
