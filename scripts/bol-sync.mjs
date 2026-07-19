#!/usr/bin/env node
/**
 * bol-sync.mjs — dagelijkse prijs-/voorraadsync voor bol-affiliateproducten.
 *
 * Haalt voor elk bolProduct-document in Sanity de actuele prijs en
 * beschikbaarheid op via de bol Marketing Catalog API en werkt Sanity bij.
 *
 * Regels (zie bol-koppeling-plan.md):
 * - prijs wijzigt → automatisch bijwerken
 * - product niet meer leverbaar (404 op /offers/best) → available: false
 *   + status: 'review' → blok verdwijnt van de site; vervanging gaat
 *   NOOIT ongezien live, dat blijft een menselijke keuze in Studio.
 *
 * Vereist in code/ingoedendoen/.env (of als omgevingsvariabelen):
 *   BOL_CLIENT_ID / BOL_CLIENT_SECRET  (affiliate-portal → Account → Open API)
 *   SANITY_PROJECT_ID                  (zelfde als de site gebruikt)
 *   SANITY_DATASET                     (optioneel, default: production)
 *   SANITY_WRITE_TOKEN                 (sanity.io/manage → API → token met schrijfrechten)
 *
 * Draaien:  node scripts/bol-sync.mjs          (echte sync)
 *           node scripts/bol-sync.mjs --dry    (alleen tonen, niets wijzigen)
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ── .env inlezen (simpel, zonder extra dependency) ─────────────
const envPath = join(ROOT, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const need = (name) => {
  const v = process.env[name];
  if (!v) { console.error(`Ontbrekende omgevingsvariabele: ${name} (zet deze in ${envPath})`); process.exit(1); }
  return v;
};

const BOL_CLIENT_ID = need('BOL_CLIENT_ID');
const BOL_CLIENT_SECRET = need('BOL_CLIENT_SECRET');
const SANITY_PROJECT_ID = need('SANITY_PROJECT_ID');
const SANITY_DATASET = process.env.SANITY_DATASET || 'production';
const SANITY_WRITE_TOKEN = DRY ? process.env.SANITY_WRITE_TOKEN : need('SANITY_WRITE_TOKEN');

// ── Stap 1: bol-token ophalen (client credentials, token ±5 min geldig) ──
async function getBolToken() {
  const basic = Buffer.from(`${BOL_CLIENT_ID}:${BOL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://login.bol.com/token?grant_type=client_credentials', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, Accept: 'application/json', 'Content-Length': '0' },
  });
  if (!res.ok) throw new Error(`bol-token mislukt: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

// ── Stap 2: beste aanbieding per EAN ────────────────────────────
// 200 → { price, availability }, 404 → niet leverbaar (null)
async function getBestOffer(token, ean) {
  const res = await fetch(
    `https://api.bol.com/marketing/catalog/v1/products/${ean}/offers/best?country-code=NL`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Accept-Language': 'nl' } }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`offer ${ean} mislukt: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── Sanity-helpers (rechtstreeks via HTTP API, geen extra dependency) ──
const sanityBase = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2025-01-01/data`;

async function sanityQuery(groq) {
  const res = await fetch(`${sanityBase}/query/${SANITY_DATASET}?query=${encodeURIComponent(groq)}`, {
    headers: SANITY_WRITE_TOKEN ? { Authorization: `Bearer ${SANITY_WRITE_TOKEN}` } : {},
  });
  if (!res.ok) throw new Error(`Sanity-query mislukt: ${res.status} ${await res.text()}`);
  return (await res.json()).result;
}

async function sanityPatch(id, set) {
  const res = await fetch(`${sanityBase}/mutate/${SANITY_DATASET}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SANITY_WRITE_TOKEN}` },
    body: JSON.stringify({ mutations: [{ patch: { id, set } }] }),
  });
  if (!res.ok) throw new Error(`Sanity-patch ${id} mislukt: ${res.status} ${await res.text()}`);
}

// ── Hoofdprogramma ──────────────────────────────────────────────
const products = await sanityQuery(`*[_type == "bolProduct"]{ _id, title, ean, price, available, status, productUrl }`);
if (!products?.length) { console.log('Geen bolProduct-documenten gevonden — niets te doen.'); process.exit(0); }

console.log(`${products.length} product(en) gevonden${DRY ? ' [DRY RUN — er wordt niets gewijzigd]' : ''}.\n`);
const token = await getBolToken();
const now = new Date().toISOString();
let changed = 0, review = 0;

for (const p of products) {
  try {
    const offer = await getBestOffer(token, p.ean);

    if (!offer) {
      // Niet meer leverbaar → markeren voor review (nooit stilzwijgend vervangen)
      if (p.available !== false || p.status !== 'review') {
        console.log(`⛔ ${p.title} (${p.ean}): niet meer leverbaar → status: review`);
        if (!DRY) await sanityPatch(p._id, { available: false, status: 'review', lastSynced: now });
        review++;
      } else {
        console.log(`⏭  ${p.title}: stond al op review`);
      }
      continue;
    }

    const newPrice = offer.price ?? offer.offer?.price ?? null;
    const newUrl = offer.url ?? null;
    // Product-URL meenemen zodat de site de affiliate-link zelf kan opbouwen.
    const urlPatch = newUrl && newUrl !== p.productUrl ? { productUrl: newUrl } : {};

    if (typeof newPrice === 'number' && newPrice !== p.price) {
      console.log(`💶 ${p.title} (${p.ean}): € ${p.price ?? '—'} → € ${newPrice}`);
      if (!DRY) await sanityPatch(p._id, { price: newPrice, available: true, lastSynced: now, ...urlPatch });
      changed++;
    } else {
      console.log(`✅ ${p.title} (${p.ean}): ongewijzigd (€ ${p.price ?? '—'})`);
      if (!DRY) await sanityPatch(p._id, { available: true, lastSynced: now, ...urlPatch });
    }

    // Nette pauze i.v.m. rate limits
    await new Promise((r) => setTimeout(r, 300));
  } catch (err) {
    console.error(`⚠️  ${p.title} (${p.ean}): ${err.message}`);
  }
}

console.log(`\nKlaar: ${changed} prijs bijgewerkt, ${review} naar reviewqueue.`);
if (review > 0) console.log('→ Open Sanity Studio en zoek een vervanger voor de producten met status "Review nodig".');
