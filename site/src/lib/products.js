/**
 * Bol-productblokken.
 *
 * Injecteert affiliate-productblokken in artikel-HTML op build-tijd.
 * Plaatsing: <div class="igd-product" data-ean="…"></div> in de bodyHtml
 * (zelfde patroon als de calculators). Zonder placeholder komen de
 * blokken onderaan het artikel te staan.
 *
 * Spelregels (zie bol-koppeling-plan.md):
 * - rel="sponsored" + zichtbare disclosure op elk blok (wettelijk verplicht)
 * - niet-beschikbare producten of producten in review worden NIET getoond
 */

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fmtPrice = (p) =>
  typeof p === 'number' ? `€ ${p.toFixed(2).replace('.', ',')}` : null;

// Jouw bol affiliate-SiteId. Zonder deze waarde kunnen kliks niet worden
// toegeschreven en verdien je geen commissie (zie bol-koppeling-plan.md).
const SITE_ID = (import.meta.env?.BOL_SITE_ID) || process.env.BOL_SITE_ID || '';

/**
 * Bouwt een bol-affiliate-trackinglink volgens het officiële deeplink-formaat:
 *   https://partner.bol.com/click/click?t=url&s=SiteId&url=ProductURL&f=api&subid=...
 * f=api = link opgebouwd via de API. subid = vrij tracking-veld; wij zetten
 * hier de artikel-slug in, zodat je in het bol-dashboard ziet welk artikel
 * de klik opleverde.
 */
export function buildAffiliateUrl(productUrl, subid) {
  if (!productUrl || !SITE_ID) return null;
  let qs = `t=url&s=${encodeURIComponent(SITE_ID)}&url=${encodeURIComponent(productUrl)}&f=api`;
  if (subid) qs += `&subid=${encodeURIComponent(subid)}`;
  return `https://partner.bol.com/click/click?${qs}`;
}

/** Effectieve affiliate-link: handmatige override, anders automatisch opgebouwd. */
function affiliateHref(p, subid) {
  return p.affiliateUrl || buildAffiliateUrl(p.productUrl, subid);
}

/** HTML voor één productblok. `subid` (artikel-slug) gaat mee in de trackinglink. */
export function productBlockHtml(p, subid) {
  const price = fmtPrice(p.price);
  const href = affiliateHref(p, subid);
  return `
<aside class="igd-product-block" role="complementary">
  <div class="igd-product-inner">
    ${p.imageUrl ? `<div class="igd-product-img"><img src="${esc(p.imageUrl)}" alt="${esc(p.title)}" loading="lazy" width="120" height="120" /></div>` : ''}
    <div class="igd-product-info">
      <strong class="igd-product-title">${esc(p.title)}</strong>
      ${p.why ? `<p class="igd-product-why"><span>Waarom dit product:</span> ${esc(p.why)}</p>` : ''}
      <div class="igd-product-row">
        ${price ? `<span class="igd-product-price">${price}</span>` : ''}
        <a class="igd-product-btn" href="${esc(href)}" rel="sponsored nofollow noopener" target="_blank">Bekijk bij bol</a>
      </div>
    </div>
  </div>
</aside>`;
}

/**
 * Vervangt placeholders in de artikel-HTML door productblokken.
 * Producten zonder placeholder worden achteraan toegevoegd.
 * Retourneert de nieuwe HTML.
 */
export function renderProductBlocks(bodyHtml, products, subid) {
  // Alleen tonen als er echt een link te maken is: handmatige override, of
  // product-URL mét SiteId. Ontbreekt de SiteId, dan blok stil weglaten
  // (liever geen blok dan een knop zonder werkende link).
  const visible = (products || []).filter(
    (p) => p && (p.affiliateUrl || (p.productUrl && SITE_ID)) && p.available !== false && p.status !== 'review'
  );

  const placeholderRe = /<div class="igd-product" data-ean="(\d+)"><\/div>/g;
  const placed = new Set();

  let html = (bodyHtml || '').replace(placeholderRe, (match, ean) => {
    const p = visible.find((x) => x.ean === ean);
    if (!p) return ''; // niet (meer) beschikbaar → blok stil weglaten
    placed.add(ean);
    return productBlockHtml(p, subid);
  });

  const rest = visible.filter((p) => !placed.has(p.ean));
  if (rest.length) html += rest.map((p) => productBlockHtml(p, subid)).join('\n');

  return html;
}
