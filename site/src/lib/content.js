/**
 * Contentbron voor de site.
 *
 * - Met SANITY_PROJECT_ID (+ optioneel SANITY_DATASET, SANITY_API_VERSION) in .env
 *   wordt content uit Sanity gehaald (schema in ../studio, import via data/sanity-import.ndjson).
 * - Zonder Sanity-configuratie valt de site terug op de lokale export in data/content.json,
 *   zodat de site altijd lokaal werkt.
 *
 * Beide bronnen leveren hetzelfde vormaat op.
 */
import { readFileSync } from 'node:fs';

let cache = null;

function loadLocal() {
  return JSON.parse(readFileSync(new URL('../../../data/content.json', import.meta.url), 'utf8'));
}

async function loadSanity(projectId) {
  const { createClient } = await import('@sanity/client');
  const client = createClient({
    projectId,
    dataset: import.meta.env.SANITY_DATASET || 'production',
    apiVersion: import.meta.env.SANITY_API_VERSION || '2025-01-01',
    useCdn: true,
  });
  const [cats, docs] = await Promise.all([
    client.fetch(`*[_type == "category"]{ "slug": slug.current, title, path, "parent": parent->slug.current }`),
    client.fetch(`*[_type in ["post", "page"]]{
      _id, _type, title, "slug": slug.current, path, publishedAt, author, excerpt,
      seoTitle, metaDescription, readingTime, featured, tags, mainImageUrl,
      mainImage{alt, "url": asset->url}, bodyHtml,
      "categories": categories[]->slug.current,
      "products": products[]->{ title, ean, productUrl, "affiliateUrl": affiliateUrl, imageUrl, why, price, available, status }
    }`),
  ]);
  const entries = docs.map((d) => ({
    id: d._id,
    kind: d._type,
    slug: d.slug,
    path: d.path,
    title: d.title,
    date: d.publishedAt,
    author: d.author,
    categories: d.categories || [],
    tags: d.tags || [],
    image: d.mainImage?.url
      ? `${d.mainImage.url}?auto=format&fit=max&w=1600&q=75` // Sanity-CDN: automatisch WebP/AVIF + resize
      : d.mainImageUrl || null,
    imageAlt: d.mainImage?.alt || null,
    excerpt: d.excerpt || '',
    seoTitle: d.seoTitle || null,
    metaDescription: d.metaDescription || null,
    readingTime: d.readingTime || 3,
    featured: !!d.featured,
    body: d.bodyHtml || '',
    products: d.products || [],
    gsc: null,
  }));
  const categories = cats.map((c) => ({
    slug: c.slug, name: c.title, parent: c.parent || null, path: c.path,
    count: entries.filter((e) => e.categories.includes(c.slug)).length,
  }));
  const local = loadLocal(); // gsc-signalen en site-metadata blijven lokaal beschikbaar
  const gscByPath = new Map(local.entries.map((e) => [e.path, e.gsc]));
  for (const e of entries) e.gsc = gscByPath.get(e.path) || null;
  return { site: local.site, categories, entries, rebuiltPages: local.rebuiltPages };
}

export async function getContent() {
  if (cache) return cache;
  const projectId = import.meta.env.SANITY_PROJECT_ID;
  if (projectId) {
    try {
      cache = await loadSanity(projectId);
      return cache;
    } catch (err) {
      console.warn('[content] Sanity niet bereikbaar, terugvallen op lokale data:', err.message);
    }
  }
  cache = loadLocal();
  return cache;
}

export async function getPosts() {
  const { entries } = await getContent();
  return entries.filter((e) => e.kind === 'post').sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPages() {
  const { entries } = await getContent();
  return entries.filter((e) => e.kind === 'page');
}

export async function getCategories() {
  const { categories } = await getContent();
  return categories;
}
