/**
 * Conversie WordPress WXR → schone content voor Astro + Sanity.
 *
 * Output in data/:
 *  - content.json          alle behouden posts/pages/categorieën/auteurs, opgeschoonde HTML
 *  - excluded.json         uitgesloten content met reden + redirect-doel
 *  - redirects.json        oude URL → nieuwe URL (voor astro.config + _redirects)
 *  - images.json           te downloaden afbeeldingen (oude URL → lokaal pad)
 *  - external-domains.json alle externe domeinen in behouden content (voor linkcheck)
 *  - sanity-import.ndjson  importbestand voor `sanity dataset import`
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Aantoonbaar dode externe links (gegenereerd door find-dead-external.mjs) → unwrappen
const deadLinksFile = path.join(root, 'data', 'dead-links.json');
const DEAD_LINKS = new Set(existsSync(deadLinksFile) ? JSON.parse(readFileSync(deadLinksFile, 'utf8')) : []);
const xml = readFileSync(path.join(root, 'ingoedendoen.WordPress.2026-07-09.xml'), 'utf8');
const gsc = JSON.parse(readFileSync(path.join(root, 'data', 'gsc-pages.json'), 'utf8'));
const gscByPath = new Map(gsc.map((r) => [new URL(r.url).pathname.replace(/\/$/, '') || '/', r]));

/* ── WXR parsing ─────────────────────────────────────────── */
const tag = (src, name) => {
  const m = src.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`));
  return m ? m[1] : '';
};
const metasOf = (src) => {
  const out = {};
  const re = /<wp:postmeta>\s*<wp:meta_key><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>\s*<\/wp:postmeta>/g;
  let m;
  while ((m = re.exec(src))) out[m[1]] = m[2];
  return out;
};
const catsOf = (src) => {
  const out = [];
  const re = /<category domain="([^"]+)" nicename="([^"]+)"><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g;
  let m;
  while ((m = re.exec(src))) out.push({ domain: m[1], slug: m[2], name: m[3] });
  return out;
};

// Categorie-definities (channel-niveau)
const catDefs = [...xml.matchAll(/<wp:category>([\s\S]*?)<\/wp:category>/g)].map((m) => ({
  slug: tag(m[1], 'wp:category_nicename'),
  parent: tag(m[1], 'wp:category_parent'),
  name: tag(m[1], 'wp:cat_name').replace(/&amp;/g, '&'),
}));
const catBySlug = new Map(catDefs.map((c) => [c.slug, c]));
const catPath = (slug) => {
  const c = catBySlug.get(slug);
  if (!c) return slug;
  return c.parent ? `${catPath(c.parent)}/${c.slug}` : c.slug;
};

// Auteurs
const authors = [...xml.matchAll(/<wp:author>([\s\S]*?)<\/wp:author>/g)].map((m) => ({
  login: tag(m[1], 'wp:author_login'),
  name: tag(m[1], 'wp:author_display_name'),
}));
const authorName = (login) => {
  const a = authors.find((x) => x.login === login);
  const n = a ? a.name : login;
  return { redactie: 'Redactie InGoedendoen', Redacteur: 'Redactie InGoedendoen', Ingoedendoen: 'Redactie InGoedendoen' }[n] || n;
};

const items = xml.split('<item>').slice(1).map((c) => c.split('</item>')[0]);
const parsed = items.map((src) => ({
  id: tag(src, 'wp:post_id'),
  title: tag(src, 'title').trim(),
  link: tag(src, 'link'),
  type: tag(src, 'wp:post_type'),
  status: tag(src, 'wp:status'),
  slug: tag(src, 'wp:post_name'),
  date: tag(src, 'wp:post_date'),
  creator: tag(src, 'dc:creator'),
  parent: tag(src, 'wp:post_parent'),
  content: tag(src, 'content:encoded'),
  excerptRaw: tag(src, 'excerpt:encoded'),
  meta: metasOf(src),
  cats: catsOf(src),
  attachmentUrl: tag(src, 'wp:attachment_url'),
}));

const attachments = new Map(parsed.filter((p) => p.type === 'attachment').map((p) => [p.id, p]));

/* ── Uitsluitingsregels ──────────────────────────────────── */
const PROMO = /\b(winactie|actie|kortingscode|black friday|webinar|weggeefactie)\b/i;
const EXCLUDED_PAGE_PATTERNS = [
  /^transfer(\/|$)/, /^confirmation-/, /^poepie-quiz/, /^kennisquiz/, /^tijdelijk$/, /^test$/, /^test-2$/,
  /^actie-/, /^vraag-het-aan-2$/, /^puistjes-quick-scan/, /^partner-vinden-test$/,
  /^cursussen?(\/|$)/, /^checkout/, /^order-/, /^account$/, /^leaderboard/,
  /^helaas$/, /^relatiegeluk/, /^sleutel-tot-relatiegeluk/, /-enquete$/,
];
// Pagina's die we op hun oude URL opnieuw opbouwen met eigen templates (geen WP-content nodig)
const REBUILT_PAGES = new Set(['home', 'contact', 'artikelen-overzicht', 'goeden-doen-dossiers']);
// Oude BB-dossierhubs → canonieke thema-archieven op /dossier/<topic>/
const DOSSIER_HUB_TARGET = {
  'allergie-dossier': 'allergie', 'nachtzweten-dossier': 'nachtzweten', 'puisten-dossier': 'puisten',
  'soa-dossier': 'soa', 'onvruchtbaar-dossier': 'onvruchtbaar', 'rimpel-dossier': 'rimpls',
  'hartslag-dossier': 'hartslag', 'migraine-dossier': 'migraine', 'nagel-dossier': 'nagels',
  'hardlopen-dossier': 'hardlopen', 'bloeddruk-dossier': 'bloeddruk',
};

// Posts die naar niet-migreerbare online tests verwijzen (stubs rond Gravity Forms)
const EXCLUDED_POST_SLUGS = new Map([
  ['hartslagcheck-gezondheid', '/dossier/hartslag/'],
  ['online-test-heb-ik-ouderdomssuiker', '/volwassen/eerste-symptomen-ouderdomssuiker/'],
]);

const posts = parsed.filter((p) => p.type === 'post' && p.status === 'publish');
const pages = parsed.filter((p) => p.type === 'page' && p.status === 'publish');

const pathOf = (link) => { try { return new URL(link).pathname.replace(/\/$/, '') || '/'; } catch { return null; } };

const excluded = [];
const keptPosts = [];
for (const p of posts) {
  const pn = pathOf(p.link);
  const g = gscByPath.get(pn);
  const year = +p.date.slice(0, 4);
  const impressions = g ? g.impr : 0;
  const yearInTitle = p.title.match(/\b20(1[0-9]|2[0-2])\b/);
  let reason = null;
  if (EXCLUDED_POST_SLUGS.has(p.slug)) {
    excluded.push({ id: p.id, type: 'post', slug: p.slug, title: p.title, date: p.date.slice(0, 10), from: pn + '/', to: EXCLUDED_POST_SLUGS.get(p.slug), reason: 'stub rond niet-migreerbare online test (Gravity Forms)', impressions });
    continue;
  }
  if (PROMO.test(p.title) || PROMO.test(p.slug)) reason = 'promotioneel / tijdgebonden actie';
  else if (yearInTitle) reason = `gedateerd jaartal in titel (${yearInTitle[0]})`;
  else if (year < 2016 && impressions === 0) reason = 'ouder dan 2016 en 0 vertoningen in GSC (laatste 3 mnd)';
  if (reason) {
    const topical = p.cats.find((c) => c.domain === 'category' && catBySlug.get(c.slug)?.parent === 'dossier');
    const audience = p.cats.find((c) => c.domain === 'category' && ['volwassen', 'tiener', 'senior', 'kind', 'baby', 'jouw-verhaal'].includes(c.slug));
    const target = topical ? `/${catPath(topical.slug)}/` : audience ? `/${audience.slug}/` : '/artikelen-overzicht/';
    excluded.push({ id: p.id, type: 'post', slug: p.slug, title: p.title, date: p.date.slice(0, 10), from: pn + '/', to: target, reason, impressions });
  } else keptPosts.push(p);
}

const keptPages = [];
for (const p of pages) {
  const pn = pathOf(p.link);
  if (pn === '/') continue; // homepage wordt herbouwd
  const rel = pn.replace(/^\//, '');
  if (EXCLUDED_PAGE_PATTERNS.some((re) => re.test(rel))) {
    let target = '/';
    if (/soa/.test(rel)) target = '/dossier/soa/';
    else if (/hartslag/.test(rel)) target = '/dossier/hartslag/';
    else if (/puistjes|acne/.test(rel)) target = '/dossier/puisten/';
    else if (/poepie|kennisquiz/.test(rel)) target = '/artikelen-overzicht/';
    else if (/morning-after/.test(rel)) target = '/dossier/soa/';
    excluded.push({ id: p.id, type: 'page', slug: p.slug, title: p.title, from: pn + '/', to: target, reason: 'interactieve test/campagnepagina zonder werkende backend (Gravity Forms/afgeronde actie)' });
    continue;
  }
  // Oude dossierhubs (Beaver Builder) → redirect naar thema-archief
  if (DOSSIER_HUB_TARGET[p.slug]) {
    excluded.push({ id: p.id, type: 'page', slug: p.slug, title: p.title, from: pn + '/', to: `/dossier/${DOSSIER_HUB_TARGET[p.slug]}/`, reason: 'Beaver Builder-hub vervangen door thema-archief op /dossier/…/' });
    continue;
  }
  // Test-checklist (hub + losse tests) leunde op Gravity Forms → uitsluiten
  if (/^test-checklist\/?$/.test(rel)) {
    excluded.push({ id: p.id, type: 'page', slug: p.slug, title: p.title, from: pn + '/', to: '/artikelen-overzicht/', reason: 'testhub zonder werkende tests (Gravity Forms)' });
    continue;
  }
  if (/^test-checklist\/.+/.test(rel)) {
    let target = '/artikelen-overzicht/';
    if (/suiker/.test(rel)) target = '/volwassen/eerste-symptomen-ouderdomssuiker/';
    if (/nachtzweet/.test(rel)) target = '/dossier/nachtzweten/';
    excluded.push({ id: p.id, type: 'page', slug: p.slug, title: p.title, from: pn + '/', to: target, reason: 'test met Gravity Forms-backend, niet migreerbaar' });
    continue;
  }
  keptPages.push(p);
}

/* ── URL-mapping voor interne links ──────────────────────── */
const newPathByOld = new Map();
for (const p of [...keptPosts, ...keptPages]) {
  const pn = pathOf(p.link);
  if (pn) newPathByOld.set(pn, pn === '/' ? '/' : pn + '/'); // structuur blijft behouden
}
const excludedByPath = new Map(excluded.map((e) => [e.from.replace(/\/$/, ''), e]));

/* ── HTML-opschoning ─────────────────────────────────────── */
const imageMap = new Map(); // oude absolute URL → lokaal pad
const externalDomains = new Map(); // domein → aantal
const CALCULATORS = new Set(['hartslag_reservecapaciteit_calculator', 'hartslag_calculator', 'max_hartslag_calculator', 'hartslag_leeftijd_calculator', 'hartslagzones_calculator', 'hardloop_tempo']);
const DROP_SHORTCODES = ['bol_product_links', 'hartslag-banner', 'nagel-banner', 'gravityform', 'do_widget', 'arplist', 'optin-monster-shortcode', 'slideshare', 'posts_carousel', 'blog', 'testimonial', 'spb_single_image', 'spb_icon_box', 'sf_iconbox', 'wpcw_courses', 'wpcw_checkout', 'wpcw_order_received', 'wpcw_order_failed', 'wpcw_account', 'wpcw_leaderboard'];
const UNWRAP_SHORTCODES = ['spb_row', 'spb_column', 'spb_text_block', 'fullwidth_text', 'one_half', 'one_half_last', 'one_third', 'one_third_last', 'two_third', 'two_third_last', 'tabs', 'tabcontainer', 'tabtext', 'tabcontent', 'boxed_content', 'box', 'spb_tabs'];

function localImagePath(url) {
  const m = url.match(/\/wp-content\/uploads\/(.+)$/);
  if (!m) return null;
  return '/uploads/' + m[1];
}
function registerImage(url) {
  const abs = url.replace(/^http:/, 'https:');
  const local = localImagePath(abs);
  if (!local) return url;
  imageMap.set(abs, local);
  return local;
}

function cleanHtml(html, { selfPath }) {
  let s = html;

  // 1. Gutenberg-blokcommentaar weg
  s = s.replace(/<!--\s*\/?wp:[^>]*-->/g, '');
  // Overige HTML-comments (o.a. Beaver Builder / more)
  s = s.replace(/<!--(?!\[)[\s\S]*?-->/g, '');

  // 2. Shortcodes
  // caption → figure/figcaption
  s = s.replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/g, (_, inner) => {
    const imgMatch = inner.match(/<a[\s\S]*?<\/a>|<img[^>]*>/);
    const img = imgMatch ? imgMatch[0] : '';
    const cap = inner.replace(/<a[\s\S]*?<\/a>|<img[^>]*>/g, '').trim();
    return `<figure>${img}${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
  });
  // sf_button / button met link-attribuut → nette knop-link (alleen interne of levende links; shop-affiliates vervallen)
  s = s.replace(/\[(?:sf_)?button([^\]]*)\]([\s\S]*?)\[\/(?:sf_)?button\]/g, (_, attrs, text) => {
    const link = (attrs.match(/link="([^"]+)"/) || [])[1];
    const label = text.replace(/<[^>]+>/g, '').trim();
    if (!link || /shopvoorgezondheid\.nl|bol\.com/.test(link)) return '';
    return `<p><a class="igd-btn" href="${link}">${label || 'Lees meer'}</a></p>`;
  });
  s = s.replace(/\[(?:sf_)?button[^\]]*\]/g, '');
  // embed → YouTube-embed of link
  s = s.replace(/\[embed[^\]]*\]\s*(\S+?)\s*\[\/embed\]/g, (_, url) => {
    const yt = url.match(/(?:youtu\.be\/|[?&]v=)([\w-]{6,})/);
    if (yt) return `<div class="igd-video"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="Video" loading="lazy" allowfullscreen></iframe></div>`;
    return `<p><a href="${url}" rel="noopener">${url}</a></p>`;
  });
  // divider → hr
  s = s.replace(/\[divider[^\]]*\]/g, '<hr>');
  // tab-titels → h3
  s = s.replace(/\[(?:spb_)?tab\s[^\]]*title="([^"]+)"[^\]]*\]/g, '<h3>$1</h3>').replace(/\[\/(?:spb_)?tab\]/g, '');
  // calculators → placeholder-div die de site hydrateert
  for (const c of CALCULATORS) s = s.replaceAll(new RegExp(`\\[${c}[^\\]]*\\]`, 'g'), `<div class="igd-calculator" data-calc="${c}"></div>`);
  // author-blokken weg (auteur staat in metadata)
  s = s.replace(/\[author\][\s\S]*?\[\/author\]/g, '').replace(/\[author_(?:image|info)[^\]]*\]([\s\S]*?)\[\/author_(?:image|info)\]/g, '').replace(/\[\/?author[^\]]*\]/g, '');
  // drop-shortcodes (met en zonder inhoud)
  for (const sc of DROP_SHORTCODES) {
    s = s.replaceAll(new RegExp(`\\[${sc}[^\\]]*\\][\\s\\S]*?\\[\\/${sc}\\]`, 'g'), '');
    s = s.replaceAll(new RegExp(`\\[${sc}[^\\]]*\\]`, 'g'), '');
  }
  // unwrap-shortcodes: alleen de tags weg, inhoud blijft
  for (const sc of UNWRAP_SHORTCODES) s = s.replaceAll(new RegExp(`\\[\\/?${sc}[^\\]]*\\]`, 'g'), '');

  // 2a2. Protocol-relatieve en relatieve upload-URL's normaliseren
  s = s.replace(/(src|href)="\/\/(www\.)?/g, '$1="https://$2');
  s = s.replace(/(src|href)="(?:\.\.\/)+wp-content\/uploads\//g, '$1="https://www.ingoedendoen.nl/wp-content/uploads/');
  s = s.replace(/(src|href)="\/wp-content\/uploads\//g, '$1="https://www.ingoedendoen.nl/wp-content/uploads/');

  // 2b. Afbeeldingen die op de bron al 403/404 geven → verwijderen (dode afbeeldingen voorkomen)
  s = s.replace(/<figure>(?:(?!<\/figure>)[\s\S])*?(?:2013\/10\/IMG_5803\.jpg|2015\/01\/citroenwater\.jpg)[\s\S]*?<\/figure>/g, '');
  s = s.replace(/<a[^>]*(?:2013\/10\/IMG_5803\.jpg|2015\/01\/citroenwater\.jpg)[^>]*>([\s\S]*?)<\/a>/g, '$1');
  s = s.replace(/<img[^>]*(?:2013\/10\/IMG_5803\.jpg|2015\/01\/citroenwater\.jpg)[^>]*>/g, '');

  // 3. Afbeeldingen: naar lokaal pad
  s = s.replace(/(<img[^>]*\ssrc=")([^"]+)("[^>]*>)/g, (_, a, src, b) => {
    if (/ingoedendoen\.nl\/wp-content\/uploads\//.test(src)) return a + registerImage(src) + b;
    return a + src + b;
  });
  s = s.replace(/(<img[^>]*\ssrcset=")([^"]*)(")/g, (_, a, srcset, b) => a + srcset.split(',').map((part) => {
    const [u, d] = part.trim().split(/\s+/);
    return /ingoedendoen\.nl\/wp-content\/uploads\//.test(u) ? [registerImage(u), d].filter(Boolean).join(' ') : part.trim();
  }).join(', ') + b);

  // 4. Links
  s = s.replace(/<a\s([^>]*)>([\s\S]*?)<\/a>/g, (whole, attrs, inner) => {
    const href = (attrs.match(/href="([^"]+)"/) || [])[1];
    if (!href) return inner;
    // interne links
    if (/^https?:\/\/(www\.)?ingoedendoen\.nl/.test(href) || href.startsWith('/')) {
      let pn;
      try { pn = href.startsWith('/') ? href.replace(/\/$/, '') : new URL(href).pathname.replace(/\/$/, ''); } catch { return inner; }
      if (pn === '') pn = '/';
      // link naar upload (afbeeldingslink) → lokaal
      if (/^\/wp-content\/uploads\//.test(pn)) return `<a href="${registerImage('https://www.ingoedendoen.nl' + pn)}">${inner}</a>`;
      if (pn + '/' === selfPath || pn === selfPath) return inner; // zelf-link
      if (newPathByOld.has(pn)) return `<a href="${newPathByOld.get(pn)}">${inner}</a>`;
      if (excludedByPath.has(pn)) return inner; // link naar uitgesloten content → alleen tekst
      // onbekende interne link (oude structuur/404) → unwrap om dode links te voorkomen
      return inner;
    }
    // externe links: registreren voor linkcheck, rel toevoegen
    try {
      const host = new URL(href).host;
      externalDomains.set(host, (externalDomains.get(host) || 0) + 1);
    } catch { return inner; }
    if (/shopvoorgezondheid\.nl|ad\.zanox\.com|zdn\.nl/.test(href)) return inner; // dode affiliate-netwerken → unwrap
    if (DEAD_LINKS.has(href)) return inner; // aantoonbaar dode externe link → unwrap
    const relAttr = /rel="/.test(attrs) ? attrs.replace(/rel="[^"]*"/, 'rel="noopener"') : attrs + ' rel="noopener"';
    return `<a ${relAttr.replace(/\s(aria-label|class|title|id|style|target)="[^"]*"/g, '')} target="_blank">${inner}</a>`;
  });

  // 5. WP-klassen en attributenrommel
  s = s.replace(/\s(?:class|id|style|width|height|sizes|title|dir|lang|align|border|cellpadding|cellspacing)="[^"]*"(?=[^<>]*>)/g, (m, offset) => {
    // behoud class op onze eigen elementen
    const before = s.slice(Math.max(0, offset - 200), offset);
    if (/igd-(btn|calculator|video)/.test(m)) return m;
    return '';
  });
  // herstel: onze eigen classes zijn hierboven mogelijk gestript → niet, want check hierboven; maar data-calc blijft sowieso
  s = s.replace(/<div\s+data-calc="([^"]+)"><\/div>/g, '<div class="igd-calculator" data-calc="$1"></div>');

  // 6. Lege elementen en dubbele witruimte
  s = s.replace(/\[\/?tab\]/g, '');
  s = s.replace(/<a\s[^>]*>(?:\s|&nbsp;)*<\/a>/g, '');
  s = s.replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/g, '');
  s = s.replace(/<(h[1-6])>(?:\s|&nbsp;)*<\/\1>/g, '');
  s = s.replace(/\n{3,}/g, '\n\n').trim();
  return s;
}

const textOf = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#\d+;/g, '').replace(/\s+/g, ' ').trim();

function buildEntry(p, kind) {
  const selfPath = pathOf(p.link) + '/';
  const usesBB = p.meta._fl_builder_enabled === '1';
  let html = cleanHtml(p.content, { selfPath });
  if (usesBB) {
    // BB-dump: dubbele h1 (paginatitel) verwijderen en losse role=button-links normaliseren
    html = html.replace(/<h1>[\s\S]*?<\/h1>/, '').replace(/<a\s+href="([^"]+)"\s+target="_self"\s+role="button">([\s\S]*?)<\/a>/g, '<p><a class="igd-btn" href="$1">$2</a></p>').trim();
  }
  const text = textOf(html);
  const words = text ? text.split(' ').length : 0;
  const thumbId = p.meta._thumbnail_id;
  const thumbAtt = thumbId ? attachments.get(thumbId) : null;
  let image = thumbAtt && thumbAtt.attachmentUrl ? registerImage(thumbAtt.attachmentUrl) : null;
  if (!image) {
    const m = html.match(/<img[^>]*\ssrc="([^"]+)"/);
    if (m) image = m[1];
  }
  if (image && /IMG_5803\.jpg|citroenwater\.jpg/.test(image)) image = null;
  const metadesc = (p.meta._yoast_wpseo_metadesc || '').trim();
  const seoTitle = (p.meta._yoast_wpseo_title || '').replace(/%%[a-z_]+%%/g, '').replace(/\s+-\s*$/, '').trim();
  const excerpt = textOf(p.excerptRaw) || metadesc || (text ? text.slice(0, 200).replace(/\s\S*$/, '…') : '');
  // 'bol' (affiliate-categorie) blijft buiten beschouwing; affiliate wordt later opnieuw ingericht
  const cats = p.cats.filter((c) => c.domain === 'category').map((c) => c.slug).filter((slug) => catBySlug.has(slug) && slug !== 'bol');
  const tags = p.cats.filter((c) => c.domain === 'post_tag').map((c) => c.name);
  return {
    id: p.id,
    kind,
    slug: p.slug,
    path: selfPath,
    title: p.title,
    date: p.date.replace(' ', 'T'),
    author: authorName(p.creator),
    categories: cats,
    tags,
    image,
    excerpt,
    seoTitle: seoTitle || null,
    metaDescription: metadesc || null,
    readingTime: Math.max(1, Math.round(words / 220)),
    featured: cats.includes('uitgelicht'),
    body: html,
    usedBeaverBuilder: usesBB,
    gsc: gscByPath.get(pathOf(p.link)) || null,
  };
}

const entries = [
  ...keptPosts.map((p) => buildEntry(p, 'post')),
  ...keptPages.filter((p) => !REBUILT_PAGES.has(p.slug)).map((p) => buildEntry(p, 'page')),
];

// Dossier-hubpagina's en andere herbouwde pagina's: alleen metadata bewaren
const rebuilt = keptPages.filter((p) => REBUILT_PAGES.has(p.slug) || /-dossier$/.test(p.slug)).map((p) => ({
  id: p.id, slug: p.slug, path: pathOf(p.link) + '/', title: p.title,
  metaDescription: (p.meta._yoast_wpseo_metadesc || '').trim() || null,
}));

// Dossierpagina's zelf ook uit entries halen (BB-hubs, worden gegenereerd)
const dossierSlugs = new Set(rebuilt.map((r) => r.slug));
let finalEntries = entries.filter((e) => !dossierSlugs.has(e.slug));

// Te dunne entries (tests/quizzen die op Gravity Forms leunden) alsnog uitsluiten
for (const e of finalEntries) {
  const words = textOf(e.body).split(' ').filter(Boolean).length;
  if (words < 40 && !/<img\s/.test(e.body)) {
    const topical = e.categories.find((slug) => catBySlug.get(slug)?.parent === 'dossier');
    const target = e.slug === 'infographics' ? '/infographics/alles-nachtzweten-infographic/' : topical ? `/${catPath(topical)}/` : '/artikelen-overzicht/';
    excluded.push({ id: e.id, type: e.kind, slug: e.slug, title: e.title, from: e.path, to: target, reason: 'vrijwel lege pagina na verwijderen formulier/affiliate-blokken', impressions: e.gsc?.impr || 0 });
    newPathByOld.delete(e.path.replace(/\/$/, ''));
  }
}
const excludedIds = new Set(excluded.map((e) => e.id));
finalEntries = finalEntries.filter((e) => !excludedIds.has(e.id));

// Tweede pas: links naar (alsnog) uitgesloten paden unwrappen zodat er geen interne redirects/404's ontstaan
const excludedPaths = new Set(excluded.map((e) => e.from));
for (const e of finalEntries) {
  e.body = e.body.replace(/<a\s[^>]*href="(\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (whole, href, inner) =>
    excludedPaths.has(href.endsWith('/') ? href : href + '/') ? inner : whole);
}

/* ── Categorieën-output ──────────────────────────────────── */
const NICE = {
  volwassen: 'Volwassen', tiener: 'Tiener', senior: 'Senior', kind: 'Kind', baby: 'Baby',
  'jouw-verhaal': 'Jouw verhaal', uitgelicht: 'Uitgelicht', dossier: 'Dossiers',
  hartslag: 'Hartslag', puisten: 'Puisten', soa: 'SOA', allergie: 'Allergie', bloeddruk: 'Bloeddruk',
  nachtzweten: 'Nachtzweten', nagels: 'Nagels', migraine: 'Migraine', onvruchtbaar: 'Onvruchtbaar?',
  rimpls: 'Rimpels', hardlopen: 'Hardlopen', overgang: 'Overgang', vaginaal: 'Vaginale klachten',
  vragen_over: 'Vraag het aan', 'voeding-bewegen': 'Voeding & bewegen', overgangsconsulente: 'Overgangsconsulente',
  'test-en-checklist': 'Test en checklist', bol: 'Bol', uncategorized: 'Overig',
};
const usedCats = new Set(finalEntries.flatMap((e) => e.categories));
for (const slug of [...usedCats]) { let c = catBySlug.get(slug); while (c?.parent) { usedCats.add(c.parent); c = catBySlug.get(c.parent); } }
const categories = catDefs.filter((c) => usedCats.has(c.slug)).map((c) => ({
  slug: c.slug, name: NICE[c.slug] || c.name, parent: c.parent || null, path: `/${catPath(c.slug)}/`,
  count: finalEntries.filter((e) => e.categories.includes(c.slug)).length,
}));

/* ── Redirects ───────────────────────────────────────────── */
const redirects = excluded.map((e) => ({ from: e.from, to: e.to }));
// oude /category/*-archieven → nieuwe thema-URL (alleen voor categorieën die een eigen pagina krijgen)
const NO_ARCHIVE = new Set(['uitgelicht', 'bol', 'uncategorized']);
for (const c of categories) redirects.push({ from: `/category/${c.slug}/`, to: NO_ARCHIVE.has(c.slug) ? '/artikelen-overzicht/' : c.path });
// WP-categorieën die geen pagina meer krijgen (o.a. bol) → archiefoverzicht
for (const c of catDefs) {
  if (!categories.some((x) => x.slug === c.slug)) redirects.push({ from: `/category/${c.slug}/`, to: '/artikelen-overzicht/' });
}

/* ── Schrijf output ──────────────────────────────────────── */
const out = (name, data) => writeFileSync(path.join(root, 'data', name), typeof data === 'string' ? data : JSON.stringify(data, null, 1));
out('content.json', { site: { title: 'InGoedendoen', description: 'Gezond, fit & vrolijk leven', url: 'https://www.ingoedendoen.nl' }, categories, entries: finalEntries, rebuiltPages: rebuilt });
out('excluded.json', excluded);
out('redirects.json', redirects);
out('images.json', Object.fromEntries(imageMap));
out('external-domains.json', Object.fromEntries([...externalDomains.entries()].sort((a, b) => b[1] - a[1])));

/* ── Sanity NDJSON ───────────────────────────────────────── */
const nd = [];
for (const c of categories) nd.push({ _id: `category-${c.slug}`, _type: 'category', title: c.name, slug: { _type: 'slug', current: c.slug }, path: c.path, parent: c.parent ? { _type: 'reference', _ref: `category-${c.parent}` } : undefined });
for (const e of finalEntries) {
  nd.push({
    _id: `${e.kind}-${e.id}`, _type: e.kind === 'post' ? 'post' : 'page',
    title: e.title, slug: { _type: 'slug', current: e.slug }, path: e.path,
    publishedAt: e.date, author: e.author, excerpt: e.excerpt,
    seoTitle: e.seoTitle || undefined, metaDescription: e.metaDescription || undefined,
    readingTime: e.readingTime, featured: e.featured || undefined,
    tags: e.tags.length ? e.tags : undefined,
    mainImageUrl: e.image || undefined,
    categories: e.categories.map((slug) => ({ _type: 'reference', _ref: `category-${slug}`, _key: `cat-${slug}` })),
    bodyHtml: e.body,
  });
}
out('sanity-import.ndjson', nd.map((d) => JSON.stringify(d)).join('\n') + '\n');

/* ── Rapport ─────────────────────────────────────────────── */
console.log(`posts behouden: ${keptPosts.length}, uitgesloten: ${excluded.filter((e) => e.type === 'post').length}`);
console.log(`pages behouden: ${finalEntries.filter((e) => e.kind === 'page').length}, herbouwd: ${rebuilt.length}, uitgesloten: ${excluded.filter((e) => e.type === 'page').length}`);
console.log(`categorieën: ${categories.length}, afbeeldingen: ${imageMap.size}, redirects: ${redirects.length}`);
console.log(`externe domeinen: ${externalDomains.size}`);
const bbLeft = finalEntries.filter((e) => e.usedBeaverBuilder);
console.log(`entries met BB (leeg lichaam!): ${bbLeft.length}`, bbLeft.map((e) => e.path).join(', '));
const short = finalEntries.filter((e) => e.kind === 'post' && !e.usedBeaverBuilder && textOf(e.body).split(' ').length < 40);
console.log(`verdacht korte posts: ${short.length}`, short.slice(0, 10).map((e) => e.path).join(', '));
const leftovers = finalEntries.filter((e) => /\[(spb_|sf_|fl_builder|bol_product|gravityform|wpcw_)/.test(e.body));
console.log(`entries met shortcode-restanten: ${leftovers.length}`, leftovers.slice(0, 10).map((e) => e.path).join(', '));
