// UI-hulpjes: categoriekleuren, datumformattering, gerelateerde artikelen.

const CAT_COLOR = {
  volwassen: 'var(--color-lime-600)',
  tiener: 'var(--color-blue-500)',
  senior: 'var(--color-pink-500)',
  kind: 'var(--color-blue-400)',
  baby: 'var(--color-pink-400)',
  'jouw-verhaal': 'var(--color-pink-500)',
  dossier: 'var(--color-lime-600)',
  uitgelicht: 'var(--color-lime-600)',
};

export function catColor(slug) {
  return CAT_COLOR[slug] || 'var(--color-neutral-500)';
}

const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const MONTHS_FULL = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

export function fmtDate(iso, full = false) {
  const d = new Date(iso);
  return `${d.getDate()} ${(full ? MONTHS_FULL : MONTHS)[d.getMonth()]} ${d.getFullYear()}`;
}

/** Primaire categorie van een artikel: eerst dossier-onderwerp, dan doelgroep. */
export function primaryCat(entry, categories) {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const topical = entry.categories.find((s) => bySlug.get(s)?.parent === 'dossier');
  if (topical) return bySlug.get(topical);
  const audience = entry.categories.find((s) => ['volwassen', 'tiener', 'senior', 'kind', 'baby', 'jouw-verhaal'].includes(s));
  if (audience) return bySlug.get(audience);
  const first = entry.categories.find((s) => bySlug.has(s) && !['uitgelicht', 'bol', 'uncategorized'].includes(s));
  return first ? bySlug.get(first) : null;
}

/** Cross-pijler bruggen voor interne links (contentplan): verbind trainen↔voeding, nachtzweten↔overgang, huid↔overgang, senior↔dossiers. */
const BRIDGES = {
  hartslag: ['hardlopen', 'voeding-bewegen', 'bloeddruk'],
  hardlopen: ['hartslag', 'voeding-bewegen'],
  'voeding-bewegen': ['hartslag', 'hardlopen'],
  nachtzweten: ['overgangsconsulente', 'bloeddruk'],
  overgangsconsulente: ['nachtzweten', 'rimpls'],
  rimpls: ['nagels', 'overgangsconsulente'],
  nagels: ['rimpls'],
  bloeddruk: ['hartslag'],
  senior: ['hartslag', 'bloeddruk', 'nachtzweten'],
};

/** Gerelateerde artikelen voor interne linkstructuur: zelfde dossier-onderwerp eerst, dan doelgroep; gesorteerd op GSC-signaal en recentheid. */
export function relatedPosts(entry, posts, categories, n = 3) {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const topics = entry.categories.filter((s) => bySlug.get(s)?.parent === 'dossier');
  const bridges = new Set(entry.categories.flatMap((s) => BRIDGES[s] || []));
  const audiences = entry.categories.filter((s) => ['volwassen', 'tiener', 'senior', 'kind', 'baby'].includes(s));
  const score = (p) => {
    if (p.path === entry.path) return -1;
    let s = 0;
    if (topics.some((t) => p.categories.includes(t))) s += 100;
    if (p.categories.some((c) => bridges.has(c))) s += 40;
    if (audiences.some((a) => p.categories.includes(a))) s += 10;
    if (s === 0) return -1;
    s += Math.min(20, Math.log2(1 + (p.gsc?.clicks || 0)) * 4);
    s += Math.min(10, Math.log10(1 + (p.gsc?.impr || 0)) * 2);
    return s;
  };
  return posts
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s || b.p.date.localeCompare(a.p.date))
    .slice(0, n)
    .map((x) => x.p);
}

/** Populairste artikelen op basis van GSC-klikken. */
export function popularPosts(posts, n = 4, excludePath = null) {
  return [...posts]
    .filter((p) => p.path !== excludePath)
    .sort((a, b) => (b.gsc?.clicks || 0) - (a.gsc?.clicks || 0) || (b.gsc?.impr || 0) - (a.gsc?.impr || 0))
    .slice(0, n);
}
